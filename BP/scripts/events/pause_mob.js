import { EffectType, EffectTypes, world, system } from "@minecraft/server";

world.beforeEvents.playerInteractWithEntity.subscribe(eventData => {
    const { player, itemStack, target } = eventData;

    if (itemStack?.typeId !== "btygames:pause_mob") return;

    const particleLocation = {
        x: target.location.x,
        y: target.location.y + 1.5,
        z: target.location.z
    };

    system.run(() => {
        if (target.hasTag("btygames:paused_mob")) {
            target.dimension.spawnParticle("minecraft:bleach", particleLocation);
            target.dimension.playSound("random.click", target.location);
            target.removeTag("btygames:paused_mob");
            target.removeEffect("minecraft:slowness");
            player.onScreenDisplay.setActionBar(
                `§b${target.typeId}§f, §b${target.id}§f has been §aunpaused§f.`
            );
            return;
        }

        target.addTag("btygames:paused_mob");
        target.addEffect("minecraft:slowness", 20000000, {
            amplifier: 255,
            showParticles: false
        });

        target.dimension.spawnParticle("minecraft:endrod", particleLocation);
        target.dimension.playSound("random.click", target.location);
    });
});
