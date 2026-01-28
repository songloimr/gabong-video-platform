class LoginModalStore {
    isOpen = $state(false);

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }
}

export const loginModal = new LoginModalStore();
