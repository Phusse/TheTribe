"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
var localDbUrl = "postgresql://postgres:phuse123@localhost:5432/thetribe_dev?schema=public";
var remoteDbUrl = process.env.DATABASE_URL;
var localPrisma = new client_1.PrismaClient({ datasourceUrl: localDbUrl });
var remotePrisma = new client_1.PrismaClient({ datasourceUrl: remoteDbUrl });
function migrateData() {
    return __awaiter(this, void 0, void 0, function () {
        var users, settings, userSettings, invites, connections, messages, groups, groupMembers, modules, lessons, sessions, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 Starting data migration from localhost to Supabase...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 35, 36, 39]);
                    return [4 /*yield*/, localPrisma.user.findMany()];
                case 2:
                    users = _a.sent();
                    if (!(users.length > 0)) return [3 /*break*/, 4];
                    console.log("Migrating ".concat(users.length, " Users..."));
                    return [4 /*yield*/, remotePrisma.user.createMany({ data: users, skipDuplicates: true })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, localPrisma.systemSettings.findMany()];
                case 5:
                    settings = _a.sent();
                    if (!(settings.length > 0)) return [3 /*break*/, 7];
                    console.log("Migrating System Settings...");
                    return [4 /*yield*/, remotePrisma.systemSettings.createMany({ data: settings, skipDuplicates: true })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [4 /*yield*/, localPrisma.userSettings.findMany()];
                case 8:
                    userSettings = _a.sent();
                    if (!(userSettings.length > 0)) return [3 /*break*/, 10];
                    console.log("Migrating User Settings...");
                    return [4 /*yield*/, remotePrisma.userSettings.createMany({ data: userSettings, skipDuplicates: true })];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [4 /*yield*/, localPrisma.invite.findMany()];
                case 11:
                    invites = _a.sent();
                    if (!(invites.length > 0)) return [3 /*break*/, 13];
                    console.log("Migrating ".concat(invites.length, " Invites..."));
                    return [4 /*yield*/, remotePrisma.invite.createMany({ data: invites, skipDuplicates: true })];
                case 12:
                    _a.sent();
                    _a.label = 13;
                case 13: return [4 /*yield*/, localPrisma.connection.findMany()];
                case 14:
                    connections = _a.sent();
                    if (!(connections.length > 0)) return [3 /*break*/, 16];
                    console.log("Migrating ".concat(connections.length, " Connections..."));
                    return [4 /*yield*/, remotePrisma.connection.createMany({ data: connections, skipDuplicates: true })];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16: return [4 /*yield*/, localPrisma.message.findMany()];
                case 17:
                    messages = _a.sent();
                    if (!(messages.length > 0)) return [3 /*break*/, 19];
                    console.log("Migrating ".concat(messages.length, " Messages..."));
                    return [4 /*yield*/, remotePrisma.message.createMany({ data: messages, skipDuplicates: true })];
                case 18:
                    _a.sent();
                    _a.label = 19;
                case 19: return [4 /*yield*/, localPrisma.group.findMany()];
                case 20:
                    groups = _a.sent();
                    if (!(groups.length > 0)) return [3 /*break*/, 22];
                    console.log("Migrating ".concat(groups.length, " Groups..."));
                    return [4 /*yield*/, remotePrisma.group.createMany({ data: groups, skipDuplicates: true })];
                case 21:
                    _a.sent();
                    _a.label = 22;
                case 22: return [4 /*yield*/, localPrisma.groupMember.findMany()];
                case 23:
                    groupMembers = _a.sent();
                    if (!(groupMembers.length > 0)) return [3 /*break*/, 25];
                    console.log("Migrating ".concat(groupMembers.length, " Group Members..."));
                    return [4 /*yield*/, remotePrisma.groupMember.createMany({ data: groupMembers, skipDuplicates: true })];
                case 24:
                    _a.sent();
                    _a.label = 25;
                case 25: return [4 /*yield*/, localPrisma.trainingModule.findMany()];
                case 26:
                    modules = _a.sent();
                    if (!(modules.length > 0)) return [3 /*break*/, 28];
                    console.log("Migrating ".concat(modules.length, " Training Modules..."));
                    return [4 /*yield*/, remotePrisma.trainingModule.createMany({ data: modules, skipDuplicates: true })];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28: return [4 /*yield*/, localPrisma.lesson.findMany()];
                case 29:
                    lessons = _a.sent();
                    if (!(lessons.length > 0)) return [3 /*break*/, 31];
                    console.log("Migrating ".concat(lessons.length, " Lessons..."));
                    return [4 /*yield*/, remotePrisma.lesson.createMany({ data: lessons, skipDuplicates: true })];
                case 30:
                    _a.sent();
                    _a.label = 31;
                case 31: return [4 /*yield*/, localPrisma.liveSession.findMany()];
                case 32:
                    sessions = _a.sent();
                    if (!(sessions.length > 0)) return [3 /*break*/, 34];
                    console.log("Migrating ".concat(sessions.length, " Live Sessions..."));
                    return [4 /*yield*/, remotePrisma.liveSession.createMany({ data: sessions, skipDuplicates: true })];
                case 33:
                    _a.sent();
                    _a.label = 34;
                case 34:
                    console.log("✅ Data migration complete!");
                    return [3 /*break*/, 39];
                case 35:
                    err_1 = _a.sent();
                    console.error("❌ Migration failed:", err_1);
                    return [3 /*break*/, 39];
                case 36: return [4 /*yield*/, localPrisma.$disconnect()];
                case 37:
                    _a.sent();
                    return [4 /*yield*/, remotePrisma.$disconnect()];
                case 38:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 39: return [2 /*return*/];
            }
        });
    });
}
migrateData();
