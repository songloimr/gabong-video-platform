class ErrorDialogStore {
  open = $state(false);
  title = $state('Error');
  message = $state('');

  show(title: string, message: string) {
    this.title = title;
    this.message = message;
    this.open = true;
  }

  hide() {
    this.open = false;
  }
}

export const errorDialog = new ErrorDialogStore();
