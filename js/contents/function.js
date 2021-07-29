const FORMS = {
    quarterINF: E(2).pow(256),
    INF: E(2).pow(1024),
    secretMessage(msg, seen=true) { return seen ? msg : "???" },
    calc_OoM(x) { return E(x).max(0).log10() },
    replicanti: {
        growth() {
            let gain = UPGS.replicanti[2].effect().pow(UPGS.replicanti[3].effect())
        
            return gain.root(this.penality()).min(FORMS.INF)
        },
        limit() { return E(10).mul(UPGS.replicanti[1].effect()) },
        penality(x = player.replicanti) {
            if (x.lt(this.limit())) return E(1)
            let a = x.logBase(this.limit())
            a = a.add(1).pow(a).pow(this.superPenality())
            if (player.prestige.upgrades.includes(13)) a = a.pow(0.75)
            return a.max(1)
        },
        superLimit() {
            let a = FORMS.quarterINF
            if (player.prestige.upgrades.includes(21)) a = a.mul(UPGS.prestige[21].effect())
            if (player.prestige.upgrades.includes(31)) a = a.mul(UPGS.prestige[31].effect())
            if (player.prestige.upgrades.includes(33)) a = a.pow(1.15)
            return a.max(1)
        },
        superPenality(x = player.replicanti) {
            if (x.lt(this.superLimit())) return E(1)
            let a = x.logBase(this.superLimit())
            if (a.lte(1)) return E(1)
            return a.pow(2).mul(3).pow(a)
        },

        galaxy: {
            req(x=player.rep_galaxy) { return E(1e6).pow(x.pow(1.25)).mul(1e12) },
            can() { return player.replicanti.gte(this.req()) },
            reset() {
                if (this.can()) {
                    player.rep_galaxy = player.rep_galaxy.add(1)
                    if (!player.prestige.upgrades.includes(14)) this.onReset()
                }
            },
            onReset() {
                if (ACHS.has(21)) player.replicanti = E(1e5)
                else player.replicanti = E(1)
                for (let x = 1; x <= UPGS.replicanti.cols; x++) player.rep_upgs[x] = E(0)
            },
            effect(x=player.rep_galaxy) {
                let ret = x
                if (player.prestige.upgrades.includes(23)) ret = ret.mul(UPGS.prestige[23].effect())
                if (player.prestige.upgrades.includes(34)) ret = ret.mul(UPGS.prestige[34].effect())
                if (ACHS.has(22)) ret = ret.mul(1.5)
                return ret.add(1).root(3)
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
            return gain.softcap(1e3,1/3,0).floor()
        },
        can() { return this.gain().gte(1) },
        reset() {
            if (this.can()) {
                player.prestige.unl = true
                player.prestige.points = player.prestige.points.add(this.gain())
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
        reached() { return player.replicanti.gte(FORMS.INF) },
        seen() { return player.inf.times.gte(1) },
        reset() {
            if (this.reached()) {
                player.inf.points = player.inf.points.add(1)
                player.inf.times = player.inf.times.add(1)
                if (player.inf.time < player.inf.best) player.inf.best = player.inf.time
                player.inf.time = 0
                ACHS.unl(21)
                this.onReset()
            }
        },
        onReset() {
            player.prestige.points = E(0)
            player.prestige.upgrades = []
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
    },
}

function getDisplayShrink(x) { return x.gte(1e4) ? "1 / "+format(x) : format(x.pow(-1)) }