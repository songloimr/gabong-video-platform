export class SidebarState {
    isOpen = $state(false);

    toggle() {
        this.isOpen = !this.isOpen;
    }

    close() {
        this.isOpen = false;
    }

    open() {
        this.isOpen = true;
    }
}

export const sidebarState = new SidebarState();
