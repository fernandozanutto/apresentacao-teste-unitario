export function getAplsSelectDynamicMultipleError(): Error {
  return Error('Cannot change `multiple` mode of select after initialization.');
}

export function getAplsSelectNonArrayValueError(): Error {
  return Error('Value must be an array in multiple-selection mode.');
}

export function getAplsSelectNonFunctionValueError(): Error {
  return Error('`compareWith` must be a function.');
}
