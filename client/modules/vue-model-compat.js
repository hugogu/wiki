export function getCompatModelValue (vm, legacyProp = 'value') {
  return typeof vm.modelValue !== 'undefined' ? vm.modelValue : vm[legacyProp]
}

export function emitCompatModelValue (vm, value) {
  vm.$emit('input', value)
  vm.$emit('update:modelValue', value)
}
