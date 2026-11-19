"""Fase 2: T1 de 250 µm do Lüsebrink (espaço nativo) -> MNI ICBM152 2009b (espaço do MASSP 2.0).

1. Reduz o T1 a 1 mm (média de blocos 4x4x4) e o molde MNI 2009b a 1 mm.
2. Registro em três etapas com SimpleITK (informação mútua de Mattes, multirresolução):
   rígido -> afim (cabeça inteira) -> afim só numa caixa em volta do tronco e do cerebelo (máscara no molde).
3. Reamostra o T1 ORIGINAL de 250 µm numa caixa do tronco em MNI, com voxels de 0,25 mm (interpolação B-spline):
   data/processed/lusebrink_tronco_mni_250um.nii.gz. A transformação vai para data/processed/lusebrink_para_mni.tfm.
4. Conferência: cortes axiais da caixa com os contornos dos núcleos do MASSP (data/processed/conferencia_*.png).

Uso: python -I scripts/process/lusebrink_mni.py
"""
import json
import sys
from pathlib import Path

import numpy as np
import SimpleITK as sitk

sys.path.insert(0, str(Path(__file__).parent))
from comum import PROCESSADO, RAIZ

T1 = RAIZ / "data" / "raw" / "lusebrink2021" / "sub-yv98_ses-3512+3555+3589+3637+3681_T1w_original.nii.gz"
MOLDE = RAIZ / "data" / "raw" / "mni_icbm152_2009b" / "tpl-MNI152NLin2009bAsym_res-1_T1w.nii.gz"
MASSP = RAIZ / "data" / "raw" / "massp2" / "ahead-massp2_avg-maxlabel_decade-18to80.nii.gz"
# caixa do tronco em MNI (mm, RAS): do tálamo inferior até a medula alta, com o cerebelo atrás
CAIXA_RAS = {"x": (-30, 30), "y": (-70, 2), "z": (-80, 4)}   # até abaixo da decussação das pirâmides
VOXEL_TRONCO = 0.25


def reduzir(img, fator):
    a = sitk.GetArrayFromImage(img).astype(np.float32)
    z, y, x = (np.array(a.shape) // fator) * fator
    a = a[:z, :y, :x].reshape(z // fator, fator, y // fator, fator, x // fator, fator).mean((1, 3, 5))
    out = sitk.GetImageFromArray(a)
    out.SetSpacing([s * fator for s in img.GetSpacing()])
    out.SetDirection(img.GetDirection())
    # origem do primeiro bloco = centro dos voxels que ele média
    desloc = np.array(img.GetDirection()).reshape(3, 3) @ (np.array(img.GetSpacing()) * (fator - 1) / 2)
    out.SetOrigin(list(np.array(img.GetOrigin()) + desloc))
    return out


def normalizar(img):
    a = sitk.GetArrayFromImage(img)
    p1, p99 = np.percentile(a[a > 0], [1, 99.5])
    return sitk.Cast(sitk.Clamp((img - float(p1)) / float(p99 - p1), lowerBound=0, upperBound=1.5), sitk.sitkFloat32)


def registrar(fixa, movel, inicial, tipo, mascara=None, niveis=(4, 2, 1), iters=200):
    r = sitk.ImageRegistrationMethod()
    r.SetMetricAsMattesMutualInformation(numberOfHistogramBins=48)
    r.SetMetricSamplingStrategy(r.RANDOM); r.SetMetricSamplingPercentage(0.15, seed=1)
    if mascara is not None:
        r.SetMetricFixedMask(mascara)
    r.SetInterpolator(sitk.sitkLinear)
    r.SetOptimizerAsRegularStepGradientDescent(learningRate=1.0, minStep=1e-4, numberOfIterations=iters, relaxationFactor=0.6)
    r.SetOptimizerScalesFromPhysicalShift()
    r.SetShrinkFactorsPerLevel(list(niveis)); r.SetSmoothingSigmasPerLevel([n / 2 for n in niveis])
    if tipo == "rigido":
        t = sitk.CenteredTransformInitializer(fixa, movel, sitk.Euler3DTransform(), sitk.CenteredTransformInitializerFilter.MOMENTS)
    else:
        t = sitk.AffineTransform(3)
        t.SetMatrix(inicial.GetMatrix()); t.SetTranslation(inicial.GetTranslation()); t.SetCenter(inicial.GetCenter())
    r.SetInitialTransform(t, inPlace=False)
    final = r.Execute(fixa, movel)
    print(f"  {tipo}{' (caixa do tronco)' if mascara is not None else ''}: métrica {r.GetMetricValue():.4f}, "
          f"{r.GetOptimizerIteration()} iterações, {r.GetOptimizerStopConditionDescription()[:60]}")
    if isinstance(final, sitk.CompositeTransform):
        final = final.GetNthTransform(final.GetNumberOfTransforms() - 1)
    return final


def ras_para_lps(p):
    return [-p[0], -p[1], p[2]]


def main():
    so_reamostrar = "--so-reamostrar" in sys.argv          # usa a transformação já gravada (só refaz o recorte)
    print("lendo o T1 de 250 µm (cerca de 2 GB em memória)...")
    t1 = sitk.ReadImage(str(T1), sitk.sitkFloat32)
    molde = sitk.ReadImage(str(MOLDE), sitk.sitkFloat32)
    print("  T1:", t1.GetSize(), t1.GetSpacing(), " molde:", molde.GetSize(), molde.GetSpacing())
    if so_reamostrar:
        return recortar(t1, sitk.AffineTransform(sitk.ReadTransform(str(PROCESSADO / "lusebrink_para_mni.tfm"))))
    t1_1mm = normalizar(reduzir(t1, 4))
    molde_1mm = normalizar(reduzir(molde, 2))

    rig = registrar(molde_1mm, t1_1mm, None, "rigido", niveis=(8, 4, 2))
    afi = registrar(molde_1mm, t1_1mm, rig, "afim", niveis=(4, 2, 1))
    # máscara do tronco e do cerebelo no molde (caixa um pouco maior que a do recorte), em coordenadas RAS
    shp = molde_1mm.GetSize()[::-1]                                          # (z, y, x)
    k, j, i = np.indices(shp)
    D = np.array(molde_1mm.GetDirection()).reshape(3, 3); S = np.array(molde_1mm.GetSpacing()); O = np.array(molde_1mm.GetOrigin())
    lps = (np.stack([i, j, k], -1).reshape(-1, 3) * S) @ D.T + O
    ras = lps * [-1, -1, 1]
    dentro = ((np.abs(ras[:, 0]) <= 45) & (ras[:, 1] >= CAIXA_RAS["y"][0] - 15) & (ras[:, 1] <= CAIXA_RAS["y"][1] + 10)
              & (ras[:, 2] >= CAIXA_RAS["z"][0] - 10) & (ras[:, 2] <= CAIXA_RAS["z"][1] + 10))
    mask = sitk.GetImageFromArray(dentro.reshape(shp).astype(np.uint8)); mask.CopyInformation(molde_1mm)
    afi2 = registrar(molde_1mm, t1_1mm, afi, "afim", mascara=mask, niveis=(2, 1), iters=300)
    sitk.WriteTransform(afi2, str(PROCESSADO / "lusebrink_para_mni.tfm"))
    recortar(t1, afi2)


def recortar(t1, afi2):

    # recorte do tronco em MNI, a 0,25 mm, a partir do T1 original
    x0, x1 = CAIXA_RAS["x"]; y0, y1 = CAIXA_RAS["y"]; z0, z1 = CAIXA_RAS["z"]
    tam = [int(round((x1 - x0) / VOXEL_TRONCO)), int(round((y1 - y0) / VOXEL_TRONCO)), int(round((z1 - z0) / VOXEL_TRONCO))]
    ref = sitk.Image(tam, sitk.sitkFloat32)
    ref.SetSpacing([VOXEL_TRONCO] * 3)
    ref.SetDirection([-1, 0, 0, 0, -1, 0, 0, 0, 1])                         # eixos RAS em LPS: índice cresce para a direita, frente e cima
    ref.SetOrigin(ras_para_lps([x0, y0, z0]))
    print("reamostrando o tronco em MNI a 0,25 mm:", tam)
    tronco = sitk.Resample(t1, ref, afi2, sitk.sitkBSpline, 0.0, sitk.sitkFloat32)
    sitk.WriteImage(sitk.Cast(sitk.Clamp(tronco, lowerBound=0), sitk.sitkFloat32), str(PROCESSADO / "lusebrink_tronco_mni_250um.nii.gz"))
    massp = sitk.ReadImage(str(MASSP))
    rot = sitk.Resample(massp, ref, sitk.Transform(), sitk.sitkNearestNeighbor, 0, sitk.sitkUInt8)
    sitk.WriteImage(rot, str(PROCESSADO / "massp_tronco_mni_250um.nii.gz"))

    M = np.array(afi2.GetMatrix()).reshape(3, 3)
    (PROCESSADO / "lusebrink_mni_registro.json").write_text(json.dumps({
        "fixa": str(MOLDE.relative_to(RAIZ)), "movel": str(T1.relative_to(RAIZ)), "transformacao": "lusebrink_para_mni.tfm",
        "tipo": "afim (rígido -> afim na cabeça -> afim na caixa do tronco), informação mútua de Mattes, SimpleITK",
        "matriz_lps": M.tolist(), "translacao_lps": list(afi2.GetTranslation()), "centro_lps": list(afi2.GetCenter()),
        "escalas": np.linalg.svd(M, compute_uv=False).tolist(), "caixa_ras_mm": CAIXA_RAS, "voxel_mm": VOXEL_TRONCO}, indent=1),
        encoding="utf-8")
    print("escalas da afim:", np.round(np.linalg.svd(M, compute_uv=False), 3))


if __name__ == "__main__":
    main()
