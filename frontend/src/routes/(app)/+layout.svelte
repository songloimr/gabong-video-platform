<script lang="ts">
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import Header from "$lib/components/layout/Header.svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import Footer from "$lib/components/layout/Footer.svelte";
    import BottomNav from "$lib/components/layout/BottomNav.svelte";
    import GlobalAnnouncementBar from "$lib/components/ui/GlobalAnnouncementBar.svelte";
    import AgeVerificationPopup from "$lib/components/ui/AgeVerificationPopup.svelte";
    import FeedbackModal from "$lib/components/FeedbackModal.svelte";
    import type { LayoutProps } from "./$types";

    let { children, data }: LayoutProps = $props();

    let showAgeVerification = $state(false);

    onMount(() => {
        if (browser) {
            const isVerified = localStorage.getItem("age_verified") === "true";
            const isEnabled =
                data.siteSettings?.age_verification_enabled ?? false;
            showAgeVerification = isEnabled && !isVerified;
        }
    });

    function handleAgeConfirm() {
        showAgeVerification = false;
    }
</script>

<GlobalAnnouncementBar announcements={data.announcements} />

<div class="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
    <div
        class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-600/15 blur-[100px] rounded-full animate-gradient"
    ></div>
    <div
        class="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-secondary-600/10 blur-[80px] rounded-full animate-gradient"
        style="animation-delay: -5s"
    ></div>
    <div
        class="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-primary-500/10 blur-[90px] rounded-full animate-gradient"
        style="animation-delay: -10s"
    ></div>
</div>

<Header settings={data.siteSettings} />

<div
    class="flex-1 flex flex-col lg:flex-row max-w-480 mx-auto w-full relative z-10"
>
    <Sidebar settings={data.siteSettings} />
    <main class="flex-1 pb-20 lg:pb-6">
        {@render children()}
    </main>
</div>

<Footer settings={data.siteSettings} />
<BottomNav />

<AgeVerificationPopup
    bind:open={showAgeVerification}
    onConfirm={handleAgeConfirm}
/>
<FeedbackModal />
