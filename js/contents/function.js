const FORMS = {
    quarterINF: E(2).pow(256),
    INF: E(2).pow(1024),
    secretMessage(msg, seen=true) { return seen ? msg : "???" },
    calc_OoM(x) { return E(x).max(0).log10() },
    replicanti: {
        growth() {
            let gain = UPGS.replicanti[2].effect()
            if (CHALS.onChal("normal2")) gain = E(2)
            gain = gain.pow(UPGS.replicanti[3].effect())
            return gain.root(this.penalty()).min(FORMS.INF)
        },
        limit() {
            let limit = E(10).mul(UPGS.replicanti[1].effect())
            return limit
        },
        penalty(x = player.replicanti) {
            if (x.lt(this.limit())) return E(1)
            let a = x.logBase(this.limit())
            a = a.add(1).pow(a).pow(this.superPenalty())
            if (player.prestige.upgrades.includes(13)) a = a.pow(0.75)
            if (CHALS.onChal("normal1")) a = a.pow(1.5)
            return a.max(1)
        },
        superLimit() {
            let a = FORMS.quarterINF
            if (player.prestige.upgrades.includes(21)) a = a.mul(UPGS.prestige[21].effect())
            if (player.prestige.upgrades.includes(31)) a = a.mul(UPGS.prestige[31].effect())
            if (player.inf.upgrades.includes(11)) a = a.mul(UPGS.post_inf[11].effect())
            if (player.prestige.upgrades.includes(33)) a = a.pow(1.15)
            return a.max(1)
        },
        superPenalty(x = player.replicanti) {
            if (x.lt(this.superLimit())) return E(1)
            let a = x.logBase(this.superLimit())
            if (a.lte(1)) return E(1)
            a = a.pow(2).mul(3).pow(a)
            return a
        },

        galaxy: {
            req(x=player.rep_galaxy) { return E(1e6).pow(x.pow(1.25).pow(CHALS.onChal("normal5")?4/3:1)).mul(1e12) },
            can() { return player.replicanti.gte(this.req()) },
            reset(bulk=false) {
                if (this.can()) {
                    if (bulk && this.bulk().gt(player.rep_galaxy)) {
                        player.rep_galaxy = this.bulk()
                    } else player.rep_galaxy = player.rep_galaxy.add(1)
                    if (!player.prestige.upgrades.includes(14)) this.onReset()
                }
            },
            onReset() {
                player.replicanti = E(1)
                if (ACHS.has(21)) player.replicanti = E(1e5)
                if (ACHS.has(26)) player.replicanti = E(1e10)
                if (ACHS.has(32)) player.replicanti = E(1e50)
                for (let x = 1; x <= UPGS.replicanti.cols; x++) player.rep_upgs[x] = E(0)
            },
            effect(x=player.rep_galaxy) {
                let ret = x
                if (player.prestige.upgrades.includes(23)) ret = ret.mul(UPGS.prestige[23].effect())
                if (player.prestige.upgrades.includes(34)) ret = ret.mul(UPGS.prestige[34].effect())
                if (ACHS.has(22)) ret = ret.mul(1.5)
                if (ACHS.has(24)) ret = ret.mul(1.25)
                return ret.add(1).root(3)
            },
            bulk(x=player.replicanti) {
                if (x.lt(1e12)) return E(0)
                return x.div(1e12).max(1).logBase(1e6).root(1.25).root(CHALS.onChal("normal5")?4/3:1).add(1).floor()
            },
        },
    },
    prestige: {
        seen() { return player.replicanti.gte(FORMS.quarterINF) || player.prestige.unl },
        gain() {
            let gain = player.replicanti.div(FORMS.quarterINF)
            if (gain.lt(1)) return E(0)
            gain = gain.root(5)
            if (player.prestige.upgrades.includes(32)) gain = gain.mul(UPGS.prestige[32].effect())
            if (CHALS.onChal("normal6")) gain = gain.pow(0.85)
            return gain.softcap(1e3,1/3,0).floor()
        },
        can() { return this.gain().gte(1) },
        reset() {
            if (this.can()) {
                player.prestige.unl = true
                player.prestige.points = player.prestige.points.add(this.gain())
                if (player.rep_galaxy.lte(0)) ACHS.unl(24)
                ACHS.unl(16)
                this.onReset()
            }
        },
        onReset() {
            player.rep_galaxy = E(0)
            FORMS.replicanti.galaxy.onReset()
        },
    },
    inf: {
        reached() { return player.replicanti.gte(FORMS.INF) && !player.breakInf },
        seen() { return player.inf.times.gte(1) },
        gain() {
            let gain = E(1)
            if (player.breakInf) gain = player.replicanti.root(FORMS.INF.log10())
            if (gain.lt(10) && player.breakInf) return E(0)
            if (ACHS.has(28)) gain = gain.mul(2)
            if (player.inf.upgrades.includes(12)) gain = gain.mul(UPGS.post_inf[12].effect())
            return gain
        },
        can() { return player.breakInf && this.gain().gte(1) },
        reset() {
            if (this.reached() || this.can()) {
                if (player.inf.time < player.inf.best) player.inf.best = player.inf.time
                if (player.chals.active.includes("normal") && !player.chals.comps.includes(player.chals.active)) {
                    player.chals.comps.push(player.chals.active)
                    ACHS.unl(25)
                    CHALS.exit()
                }
                player.inf.points = player.inf.points.add(this.gain())
                player.inf.times = player.inf.times.add(1)
                ACHS.unl(21)
                if (player.rep_galaxy.lte(0)) ACHS.unl(33)
                this.onReset()
            }
        },
        onReset() {
            player.inf.time = 0
            player.prestige.points = E(0)
            if (!player.inf.upgrades.includes(13)) player.prestige.upgrades = []
            FORMS.prestige.onReset()
        },
        replicanti: {
            growth() { return UPGS.inf_rep[1].effect().root(FORMS.inf.comp.effect().nerf) },
            effect() {
                let ret = player.inf.replicanti.log10().div(10).add(1).add(FORMS.inf.comp.effect().buff).softcap(2,0.75,0)
                return ret
            },
        },
        comp: {
            req() { return E(1e10) },
            can() { return player.inf.replicanti.gte(this.req()) },
            reset() {
                if (this.can()) {
                    player.inf.comp = player.inf.comp.add(1)
                    this.onReset()
                }
            },
            onReset() {
                player.inf.replicanti = E(1)
            },
            effect(x=player.inf.comp) {
                let ret = {}
                ret.buff = x
                ret.nerf = x.add(1).pow(1.5)
                return ret
            },
        },
        break: {
            seen() { return player.chals.comps.includes("normal1") 
            && player.chals.comps.includes("normal2") 
            && player.chals.comps.includes("normal3") 
            && player.chals.comps.includes("normal4") 
            && player.chals.comps.includes("normal5") 
            && player.chals.comps.includes("normal6") },
            msg() { return player.breakInf ? "Fix Infinity" : "Break Infinity" },
        },
    },
}

function getDisplayShrink(x) { return x.gte(1e4) ? "1 / "+format(x) : format(x.pow(-1)) }