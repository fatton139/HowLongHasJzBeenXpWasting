import * as express from "express";
import hiscores, { Player } from "osrs-json-hiscores";

namespace Locals {
    export let lastXpUpdate: Date = new Date();
    export let lastUpdateData: Player;
}

const router = express.Router();

type DateBreakdown = {
    hours: number;
    minutes: number;
};

type ResponseWrapper = {
    playerData: Player;
    lastXpUpdate: string;
    lastXpUpdateBreakdown: DateBreakdown;
    xpDifferenceSinceUpdate: number;
};

router.get("/", async (req, res) => {
    res.render("index");
});

const computeXpDifference = (newData: Player, oldData: Player): number => {
    return newData.main.skills.overall.xp - oldData.main.skills.overall.xp;
};

const hasXpDifference = (newData: Player, oldData: Player): boolean => {
    if (!newData || !oldData) {
        return false;
    }
    return computeXpDifference(newData, oldData) !== 0;
};

const getFormattedDateTimeString = (date: Date): string => {
    return `${date.toDateString()}, ${date.toLocaleTimeString()}`;
}

router.get("/isJzXpWaste", async (req, res) => {
    const currentDate: Date =  new Date();
    const latestData: Player = await hiscores.getStats("Jz Cx");

    if (!Locals.lastXpUpdate) {
        Locals.lastXpUpdate = currentDate;
    }

    if (!Locals.lastUpdateData) {
        Locals.lastUpdateData = latestData;
    }

    if (hasXpDifference(latestData, Locals.lastUpdateData)) {
        Locals.lastXpUpdate = currentDate;
        Locals.lastUpdateData = latestData;
    }

    const lastXpUpdateBreakdown = {
        hours: Math.floor(((currentDate as any) - (Locals.lastXpUpdate as any)) / (1000 * 60 * 60)),
        minutes: Math.floor(((currentDate as any) - (Locals.lastXpUpdate as any)) / (1000 * 60)) % 60,
    };

    const responseWrapper: ResponseWrapper = {
        playerData: latestData,
        lastXpUpdate: Locals.lastXpUpdate ? getFormattedDateTimeString(Locals.lastXpUpdate) : getFormattedDateTimeString(currentDate),
        xpDifferenceSinceUpdate: computeXpDifference(Locals.lastUpdateData, latestData),
        lastXpUpdateBreakdown,
    };
    res.send(JSON.stringify(responseWrapper));

});

export default router;
