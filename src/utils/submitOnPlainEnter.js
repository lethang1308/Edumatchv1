/**
 * Sends a form with Enter while keeping Shift + Enter available for a new line.
 */
export const submitOnPlainEnter = (event) => {
  if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
};
