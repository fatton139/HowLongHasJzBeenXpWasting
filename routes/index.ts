import * as express from "express";
import { MongoClient, Db, Collection } from "mongodb";
import hiscores, { Player } from "osrs-json-hiscores";

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
};

const getLastXpUpdate = async (): Promise<Date | undefined> => {
    const data = await collection.findOne({});
    return data.lastXpUpdate;
};

const getLastUpdateData = async (): Promise<Player | undefined> => {
    const data = await collection.findOne({});
    return data.lastUpdateData;
};

const getLastXpUpdateBreakdown = (currentDate: Date, lastXpUpdate: Date) => {
    return {
        hours: Math.floor(((currentDate as any) - (lastXpUpdate as any)) / (1000 * 60 * 60)),
        minutes: Math.floor(((currentDate as any) - (lastXpUpdate as any)) / (1000 * 60)) % 60,
    };
};

type PlayerData = {
    lastXpUpdate: Date,
    lastUpdateData: Player,
};

let collection: Collection<PlayerData>;

router.get("/", async (req, res) => {
    const client = await MongoClient.connect(process.env.DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db("Cluster0");
    collection = db.collection("data");
    const currentDate: Date = new Date();
    const latestData: Player = await hiscores.getStats("Jz Cx");
    const lastXpUpdate = await getLastXpUpdate();
    const lastUpdateData = await getLastUpdateData();
    res.render("index", {
        playerData: latestData,
        lastXpUpdate: getFormattedDateTimeString(lastXpUpdate),
        xpDifferenceSinceUpdate: computeXpDifference(lastUpdateData, latestData),
        lastXpUpdateBreakdown: getLastXpUpdateBreakdown(currentDate, lastXpUpdate),
    });
});

router.get("/isJzXpWaste", async (req, res) => {
    const currentDate: Date = new Date();
    const latestData: Player = await hiscores.getStats("Assasindie");
    let lastXpUpdate = await getLastXpUpdate();
    let lastUpdateData = await getLastUpdateData();

    if (hasXpDifference(latestData, lastUpdateData)) {
        await collection.updateOne({}, { $set: {lastXpUpdate: currentDate}});
        await collection.updateOne({}, { $set: {lastUpdateData: latestData}});
        lastXpUpdate = currentDate;
        lastUpdateData = latestData;
    }

    const lastXpUpdateBreakdown = getLastXpUpdateBreakdown(currentDate, lastXpUpdate);

    const responseWrapper: ResponseWrapper = {
        playerData: latestData,
        lastXpUpdate: getFormattedDateTimeString(lastXpUpdate),
        xpDifferenceSinceUpdate: computeXpDifference(lastUpdateData, latestData),
        lastXpUpdateBreakdown,
    };
    res.send(JSON.stringify(responseWrapper));
});

export default router;
