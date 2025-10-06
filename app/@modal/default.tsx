export default function DefaultModalSlot() {
  // When the modal slot is not active, render nothing so the modal is closed on
  // full page refreshes or navigations that shouldn't show the slot.
  return null
}
