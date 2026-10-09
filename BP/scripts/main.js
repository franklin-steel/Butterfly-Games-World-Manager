import { world, system, WeatherType, TimeOfDay, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import "./events/pause_mob";

world.beforeEvents.itemUse.subscribe(eventData => {
    const { source, itemStack } = eventData;

    if (itemStack?.typeId !== "btygames:world_manager") return;

    const currentDayCycle = world.gameRules.doDayLightCycle;
    const currentDoMobSpawning = world.gameRules.doMobSpawning;
    const currentDoWeatherCycle = world.gameRules.doWeatherCycle;

    const menu = new ActionFormData();
    menu.title(`World Manager — @btygames`)
        .button("World Settings")
        .divider()
        .label("Execution commands")
        .button(`Kill All Mobs`, "textures/icons/kill_all_mobs_icon.png")
        .button(`Remove Drops`, "textures/icons/remove_drops_icon.png")
        .button(`Clear Weather`, "textures/icons/clear_weather_icon.png")
        .divider()
        .label("Tools")
        .button(`Pause Mob`, "textures/icons/pause_mob_icon.png")
        .button(`Rotate Mob`, "textures/icons/rotate_mob_icon.png");

    const modalForm = new ModalFormData();
    modalForm.title(`World Settings `);

    let timeOfDayList = [
        { name: "Sunrise", id: TimeOfDay.Sunrise },
        { name: "Day", id: TimeOfDay.Day },
        { name: "Noon", id: TimeOfDay.Noon },
        { name: "Sunset", id: TimeOfDay.Sunset },
        { name: "Night", id: TimeOfDay.Night },
        { name: "Midnight", id: TimeOfDay.Midnight }
    ];

    const getTimeIndex = time => {
        if (time >= 1000 && time < 6000)
            return 1; // Day
        else if (time >= 6000 && time < 12000)
            return 2; // Noon
        else if (time >= 12000 && time < 13000)
            return 3; // Sunset
        else if (time >= 13000 && time < 18000)
            return 4; // Night
        else if (time >= 18000 && time < 23000)
            return 5; // Midnight
        else return 0; // Sunrise (23000-23999 e 0-999)
    };

    // setTimeOfDay
    modalForm.dropdown(
        "Available times",
        timeOfDayList.map(time => time.name),
        { defaultValueIndex: getTimeIndex(world.getTimeOfDay()) }
    );

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

    // doWeatherCycle
    modalForm.toggle("Stop weather cycle", {
        defaultValue: !currentDoWeatherCycle,
        tooltip: "When activated, the weather cycle is paused, disabling any related event."
    });

    system.run(() => {
        menu.show(source).then(response => {
            if (response.canceled) return;

            // World Settings
            if (response.selection === 0) {
                modalForm.show(source).then(response => {
                    if (response.canceled) return;

                    const [setTimeOfDay, stopDayCycle, doMobSpawning, doWeatherCycle] =
                        response.formValues;

                    world.setTimeOfDay(timeOfDayList[setTimeOfDay].id);

                    world.gameRules.doDayLightCycle = !stopDayCycle;
                    world.gameRules.doMobSpawning = !doMobSpawning;
                    world.gameRules.doWeatherCycle = !doWeatherCycle;
                });
            } else if (response.selection === 1) {
                source.runCommand("kill @e[type=!player,type=!item]");
                source.onScreenDisplay.setActionBar(`§aAll mobs have been killed.`);
                source.playSound("note.pling");
            } else if (response.selection === 2) {
                source.runCommand("kill @e[type=item]");
                source.onScreenDisplay.setActionBar(`§aAll items have been killed.`);
                source.playSound("note.pling");
            } else if (response.selection === 3) {
                source.dimension.setWeather(WeatherType.Clear);
                source.onScreenDisplay.setActionBar(`§aThe weather has been cleared.`);
                source.playSound("note.pling");
            } else if (response.selection === 4) {
                const sourceInventory = source.getComponent("minecraft:inventory").container;
                const sourceEmptySlots = sourceInventory.emptySlotsCount;
                if (sourceEmptySlots === 0) {
                    source.onScreenDisplay.setActionBar(`§cYour inventory is full.`);
                    source.playSound("note.bass");
                    return;
                }

                const item = new ItemStack("btygames:pause_mob", 1);
                sourceInventory.addItem(item);
            }
        });
    });
});
