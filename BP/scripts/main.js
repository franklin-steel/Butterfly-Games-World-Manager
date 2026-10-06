import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

world.beforeEvents.itemUse.subscribe(eventData => {
    const { source, itemStack } = eventData;

    const currentDayCycle = world.gameRules.doDayLightCycle;
    const currentDoMobSpawning = world.gameRules.doMobSpawning;

    const menu = new ActionFormData();
    menu.title(`World Manager — @btygames`)
        .button("World Settings")
        .divider()
        .label("Execution commands")
        .button(`Kill All Mobs\n§9The player will be ignored.`)
        .button(`Remove Drops\n§cRemove all items dropped.`)
        .divider()
        .label("Tools")
        .button(`Pause Mob\n§2Makes the mob not move.`)
        .button(`Rotation Mob\n§6Rotate the mob freely.`);

    const modalForm = new ModalFormData();

    modalForm.title(`World Settings `);

    // TOGGLES

    // doDayLightCycle
    modalForm.toggle("Stop the day cycle", {
        defaultValue: !currentDayCycle,
        tooltip: "When activated, the day cycle is paused, making it seem as if time does not pass."
    });

    // doMobSpawning
    modalForm.toggle("Stop mob spawning", {
        defaultValue: !currentDoMobSpawning,
        tooltip: "When activated, mobs stop spawning."
    });

    system.run(() => {
        menu.show(source).then(response => {
            if (response.canceled) return;

            // World Settings
            if (response.selection === 0) {
                modalForm.show(source).then(response => {
                    if (response.canceled) return;

                    const [stopDayCycle, doMobSpawning] = response.formValues;
                    world.gameRules.doDayLightCycle = !stopDayCycle;
                    world.gameRules.doMobSpawning = !doMobSpawning;
                });
            }
        });
    });
});
