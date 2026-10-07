import { world, system, WeatherType, TimeOfDay } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

world.beforeEvents.itemUse.subscribe(eventData => {
    const { source, itemStack } = eventData;

    const currentDayCycle = world.gameRules.doDayLightCycle;
    const currentDoMobSpawning = world.gameRules.doMobSpawning;
    const currentDoWeatherCycle = world.gameRules.doWeatherCycle;

    const menu = new ActionFormData();
    menu.title(`World Manager — @btygames`)
        .button("World Settings")
        .divider()
        .label("Execution commands")
        .button(`Kill All Mobs\n§9The player will be ignored.`)
        .button(`Remove Drops\n§cRemove all items dropped.`)
        .button(`Clear Weather\n§bClear all weather conditions`)
        .divider()
        .label("Tools")
        .button(`Pause Mob\n§2Makes the mob not move.`)
        .button(`Rotation Mob\n§6Rotate the mob freely.`);

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
        "Avaliable times",
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
            } else if (response.selection === 2) {
                source.runCommand("kill @e[type=item]");
            } else if (response.selection === 3) {
                source.dimension.setWeather(WeatherType.Clear);
            }
        });
    });
});
