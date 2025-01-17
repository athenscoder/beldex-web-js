'use strict'

const View = require('../Views/View.web')

function New_fieldValue_labeledRangeInputView (params, context) {
  //
  const changed_fn = params.changed_fn || function (value) {}
  const finalized_labelText_fn = params.finalized_labelText_fn || function (float_inputValue) { return '' + float_inputValue }
  //
  const min = params.min
  const max = params.max
  const range = max - min
  const step = params.step
  const optl_existingValue = params.existingValue
  const optl_defaultValue = params.default
  const value = typeof optl_existingValue !== 'undefined' && optl_existingValue !== null ? optl_existingValue
    : typeof optl_defaultValue !== 'undefined' && optl_defaultValue !== null ? optl_defaultValue
      : min
  const isMaxInfinity = params.isMaxInfinity === true
  const labelForInfinity = params.labelForInfinity || 'Infinity' // like "Never"
  //
  const labelFor_min = params.slideSideLabelFor_min || '' + min
  const labelStyleWidthFor_min = params.slideSideLabelStyleWidthFor_min || '50px'
  const labelFor_max = params.slideSideLabelFor_max || '' + max
  const labelStyleWidthFor_max = params.slideSideLabelStyleWidthFor_max || '50px'
  //
  const view = new View({ tag: 'table' }, context)
  const table = view.layer
  table.className = 'labeledRangeInput-container'
  table.style.height = '40px'
  table.style.width = '100%'
  table.style.paddingTop = '14px'
  //
  const tr = document.createElement('tr')
  table.appendChild(tr)
  //
  function __new_sliderSide_labelLayer (text) {
    const sliderSide_labelLayer = document.createElement('div')
    sliderSide_labelLayer.innerHTML = text
    sliderSide_labelLayer.style.fontFamily = 'Native-Light, input, menlo, monospace'
    sliderSide_labelLayer.style.color = '#8d8b8d'
    sliderSide_labelLayer.style.webkitFontSmoothing = 'subpixel-antialiased'
    sliderSide_labelLayer.style.fontSize = '11px'
    return sliderSide_labelLayer
  }
  const td_1 = document.createElement('td')
  td_1.align = 'left'
  td_1.valign = 'bottom'
  td_1.style.width = labelStyleWidthFor_min
  const min_labelLayer = __new_sliderSide_labelLayer(labelFor_min)
  min_labelLayer.style.marginBottom = '-10px'
  td_1.appendChild(min_labelLayer)
  tr.appendChild(td_1)
  //
  const td_2 = document.createElement('td')
  td_2.style.position = 'relative'
  td_2.style.left = '0'
  td_2.style.top = '0'
  td_2.style.width = 'calc(100% - 10px)'
  td_2.style.padding = '0 5px'
  tr.appendChild(td_2)
  //
  const labelLayer = document.createElement('div')
  labelLayer.style.position = 'relative'
  labelLayer.style.top = '-10px'
  const labelLayer_width = 100 // give it enough room for most labels - 'auto' would be nice
  labelLayer.style.width = labelLayer_width + 'px'
  labelLayer.style.textAlign = 'center'
  labelLayer.style.height = '15px'
  labelLayer.style.fontFamily = 'Native-Light, input, menlo, monospace'
  labelLayer.style.fontWeight = '100'
  labelLayer.style.webkitFontSmoothing = 'subpixel-antialiased'
  labelLayer.style.color = '#f8f8f8'
  labelLayer.style.fontSize = '11px'
  td_2.appendChild(labelLayer) // must be in container rather than on slider
  //
  const sliderRunnableTrackGraphicLayer = document.createElement('div')
  sliderRunnableTrackGraphicLayer.className = 'slider-runnable-track'
  td_2.appendChild(sliderRunnableTrackGraphicLayer)
  //
  const layer = document.createElement('input')
  {
    layer.type = 'range'
    layer.min = min
    layer.max = max
    layer.step = step
    layer.value = value
    //
    layer.className = 'labeledRangeInput'
    layer.style.width = '100%'
    layer.style.display = 'inline-block'
  }
  td_2.appendChild(layer)
  //
  const td_3 = document.createElement('td')
  td_3.align = 'right'
  td_3.style.width = labelStyleWidthFor_max
  const max_labelLayer = __new_sliderSide_labelLayer(labelFor_max)
  max_labelLayer.style.marginBottom = '-10px'
  td_3.appendChild(max_labelLayer)
  tr.appendChild(td_3)
  //
  layer.onchange = function () {
    changed_fn(layer.value)
  }
  layer.oninput = function () {
    view._updateAndLayoutLabel()
  }
  view._window_resize_fn = function () {
    view._updateAndLayoutLabel()
  }
  window.addEventListener('resize', view._window_resize_fn)
  view.__finalized_labelText_fn = function (inputValue) {
    const float_inputValue = parseFloat(inputValue)
    const float_max = parseFloat(max)
    // ^- going to assuming float is a good medium for numerical comparison - supposing JS doesn't screw it up
    if (isNaN(float_inputValue)) {
      throw 'Range input value cannot be parsed as float for comparison'
    }
    if (isNaN(float_max)) {
      throw 'Range input max cannot be parsed as float for comparison'
    }
    if (float_inputValue === float_max) {
      if (isMaxInfinity) {
        return labelForInfinity
      }
    }
    // else let consumer finalize
    return finalized_labelText_fn(float_inputValue)
  }
  //
  view._updateAndLayoutLabel = function () {
    labelLayer.innerHTML = view.__finalized_labelText_fn(layer.value)
    //
    const offsetWidth = layer.offsetWidth
    let knob_next_x_pct = (layer.value - min) / range
    if (knob_next_x_pct < 0) {
      knob_next_x_pct = 0
    } else if (knob_next_x_pct > 1) {
      knob_next_x_pct = 1
    }
    const knob_x_px = offsetWidth * knob_next_x_pct
    const next_x_px = knob_x_px - (labelLayer_width / 2) - 12 * (knob_next_x_pct - 0.5) // this -knobWidth*pct-.5 is to offset the label in relation to the knob's displacement from the center as knob ends never move past track ends
    labelLayer.style.left = next_x_px + 'px'
  }
  view._updateAndLayoutLabel() // initial
  //
  view.TearDown = function () { // NOTE: you must call this!
    console.log('♻️  Tearing down labeled range input.')
    window.removeEventListener('resize', view._window_resize_fn)
  }
  //
  view.SetValueMax = function () {
    layer.value = max
    view._updateAndLayoutLabel()
  }
  view.SetValue = function (value) {
    layer.value = value
    view._updateAndLayoutLabel()
  }
  view.SetEnabled = function (isEnabled) {
    view.isEnabled = isEnabled
    if (isEnabled == false) {
      view.layer.classList.add('disabled')
    } else {
      view.layer.classList.remove('disabled')
    }
    layer.disabled = !isEnabled
  }
  //
  return view
}
exports.New_fieldValue_labeledRangeInputView = New_fieldValue_labeledRangeInputView
//
function New_fieldValue_timeBasedLabeledRangeInputView (params, context) {
  const optl_displayAsMinutesAtXMin = params.displayAsMinutesAtXMin
  const isToDisplayAsMinsAfterXMin = typeof optl_displayAsMinutesAtXMin !== 'undefined'
  params.finalized_labelText_fn = function (float_inputValue) {
    if (isToDisplayAsMinsAfterXMin) {
      const secondsAtWhichToDisplayAsMins = optl_displayAsMinutesAtXMin * 60.0
      if (float_inputValue >= secondsAtWhichToDisplayAsMins) {
        return (float_inputValue / 60.0).toFixed(0) + 'm' // decimal pl makes it look a little sloppy
      }
    }

    return float_inputValue + 's'
  }
  //
  const view = New_fieldValue_labeledRangeInputView(params, context)
  return view
}
exports.New_fieldValue_timeBasedLabeledRangeInputView = New_fieldValue_timeBasedLabeledRangeInputView
//
