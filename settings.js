const quality = document.querySelector('#quality');
const qualityValue = document.querySelector('#qualityValue');

quality.oninput = () => {
    const value = quality.value;
    qualityValue.innerText = value;
    // lightSource.setRayDensity(value);
}