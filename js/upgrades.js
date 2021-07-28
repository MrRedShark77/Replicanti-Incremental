const UPGS = {
    replicanti: {
        cols: 4,
        can(x) { return player.replicanti.gte(this[x].cost()) },
        buy(x) {
            if (this.can(x)) {
                player.replicanti = player.replicanti.sub(this[x].cost()).max(1)
                player.rep_upgs[x] = player.rep_upgs[x].add(1)
            }
        },
        buyMax() {
            for (let x = 1; x <= this.cols; x++) if (this.can(x)) {
                let bulk = this[x].bulk()
                if (bulk.gt(player.rep_upgs[x])) {
                    player.replicanti = player.replicanti.sub(this[x].cost(bulk.sub(1))).max(1)
                    player.rep_upgs[x] = bulk
                }
            }
        },
        1: {
            id: 1,
            title: "Replicanti Storage",
            cost(x=player.rep_upgs[this.id]) { return E(2).pow(x.pow(1.5)).mul(10) },
            effect(x=player.rep_upgs[this.id]) {
                let ret = E(2).mul(FORMS.replicanti.galaxy.effect()).mul(FORMS.inf.replicanti.effect()).mul(UPGS.replicanti[4].effect()).pow(x)
                return ret
            },
            desc(eff=this.effect()) { return `Make Replicanti penality starts ${format(eff)}x later.` },
            bulk(x=player.replicanti) {
                if (x.div(10).lt(1)) return E(0)
                let bulk = x.div(10).logBase(2).root(1.5).add(1).floor()
                return bulk
            },
        },
        2: {
            id: 2,
            title: "Replicanti Multiplier",
            cost(x=player.rep_upgs[this.id]) { return E(10).pow(x.pow(1.5)) },
            effect(x=player.rep_upgs[this.id]) {
                let lvl = x.mul(FORMS.replicanti.galaxy.effect()).mul(FORMS.inf.replicanti.effect())
                if (player.prestige.upgrades.includes(11)) lvl = lvl.mul(2)
                if (player.prestige.upgrades.includes(12)) lvl = lvl.pow(UPGS.prestige[12].effect())
                return lvl.div(5).add(1)
            },
            desc(eff=this.effect()) { return `Multiple Replicanti growth by ${format(eff)}x.` },
            bulk(x=player.replicanti) {
                let bulk = x.logBase(10).root(1.5).add(1).floor()
                return bulk
            },
        },
        3: {
            id: 3,
            title: "Replicanti Power",
            cost(x=player.rep_upgs[this.id]) { return E(10).pow(x.pow(2)).mul(1000) },
            effect(x=player.rep_upgs[this.id]) {
                let lvl = x.mul(FORMS.inf.replicanti.effect())
                if (player.prestige.upgrades.includes(12)) lvl = lvl.pow(UPGS.prestige[12].effect())
                return lvl.div(5).mul(FORMS.replicanti.galaxy.effect()).add(1).softcap(100,1/3,0).softcap(1000,1/3,0)
            },
            desc(eff=this.effect()) { return `Make Replicanti growth is ^${format(eff)} stronger.` },
            bulk(x=player.replicanti) {
                if (x.div(1000).lt(1)) return E(0)
                let bulk = x.div(1000).logBase(10).root(2).add(1).floor()
                return bulk
            },
        },
        4: {
            id: 4,
            title: "Repeated Replicanti",
            cost(x=player.rep_upgs[this.id]) { return E(10).pow(x.pow(2)).mul(1e16) },
            effect(x=player.rep_upgs[this.id]) {
                let ret = player.replicanti.log10().mul(x).mul(FORMS.replicanti.galaxy.effect()).mul(FORMS.inf.replicanti.effect()).add(1).root(10)
                if (player.prestige.upgrades.includes(22)) ret = ret.pow(2)
                return ret
            },
            desc(eff=this.effect()) { return `Make Replicanti Storage is ${format(eff)}x stronger based on replicanti.` },
            bulk(x=player.replicanti) {
                if (x.div(1e16).lt(1)) return E(0)
                let bulk = x.div(1e16).logBase(10).root(2).add(1).floor()
                return bulk
            },
        },
    },
    prestige: {
        cols: 4,
        rows: 4,
        can(x) { return player.prestige.points.gte(this[x].cost) && !player.prestige.upgrades.includes(x) },
        buy(x) {
            if (this.can(x)) {
                player.prestige.points = player.prestige.points.sub(this[x].cost)
                player.prestige.upgrades.push(x)
            }
        },
        11: {
            unl() { return true },
            desc: "Replicanti Multiplier is twice effective.",
            cost: E(1),
        },
        12: {
            unl() { return true },
            desc: "Replicanti Multiplier/Power is stronger based on unspent Prestige points.",
            cost: E(3),
            effect() {
                let ret = player.prestige.points.add(1).log10().add(1).root(2)
                return ret
            },
            effDesc(eff=this.effect()) { return "^"+format(eff) },
        },
        13: {
            unl() { return true },
            desc: "Replicanti Penality is 25% weaker.",
            cost: E(10),
        },
        14: {
            unl() { return true },
            desc: "Replicanti Galaxy no longer resets anything.",
            cost: E(25),
        },
        21: {
            unl() { return true },
            desc: "Replicanti Slowdown starts later based on unspent Prestige points.",
            cost: E(100),
            effect() {
                let ret = player.prestige.points.add(1).pow(2)
                if (player.prestige.upgrades.includes(24)) ret = ret.pow(UPGS.prestige[24].effect())
                return ret.softcap(1e40,1/3,0)
            },
            effDesc(eff=this.effect()) { return "x"+format(eff)+" later" },
        },
        22: {
            unl() { return true },
            desc: "Repeated Replicanti is twice stronger.",
            cost: E(2.5e3),
        },
        23: {
            unl() { return true },
            desc: "Replicanti Galaxy is stronger based on unspent Prestige points.",
            cost: E(2.5e4),
            effect() {
                let ret = player.prestige.points.add(1).log10().add(1).pow(0.6)
                return ret
            },
            effDesc(eff=this.effect()) { return format(eff.sub(1).mul(100))+"% stronger" },
        },
        24: {
            unl() { return true },
            desc: "Prestige upgrade 5 is raised by Replicanti Galaxy.",
            cost: E(5e5),
            effect() {
                let ret = player.rep_galaxy.add(1).root(3)
                return ret
            },
            effDesc(eff=this.effect()) { return "^"+format(eff) },
        },
        31: {
            unl() { return true },
            desc: "Replicanti Slowdown starts 1.15x later for every OoM of Replicanti.",
            cost: E(1e7),
            effect() {
                let ret = E(1.15).pow(player.replicanti.log10().softcap(FORMS.INF.log10(), 1/2, 0))
                if (player.prestige.upgrades.includes(41) && player.prestige.upgrades.includes(24)) ret = ret.pow(UPGS.prestige[24].effect())
                return ret
            },
            effDesc(eff=this.effect()) { return "x"+format(eff)+" later" },
        },
        32: {
            unl() { return true },
            desc: "Presige points boosts itself.",
            cost: E(1e9),
            effect() {
                let ret = player.prestige.points.add(1).log10().add(1).pow(2)
                return ret
            },
            effDesc(eff=this.effect()) { return "x"+format(eff) },
        },
        33: {
            unl() { return true },
            desc: "Replicanti Slowdown starts ^1.15 later.",
            cost: E(1e10),
        },
        34: {
            unl() { return true },
            desc: "Replicanti Galaxy is 1.5% stronger for every OoM of Replicanti.",
            cost: E(5e12),
            effect() {
                let ret = E(0.015).mul(player.replicanti.log10()).add(1)
                return ret
            },
            effDesc(eff=this.effect()) { return format(eff.sub(1).mul(100))+"% stronger" },
        },
        41: {
            unl() { return true },
            desc: "Prestige upgrade 8 can boost Prestige upgrade 9.",
            cost: E(1e14),
        },
    },
    inf_rep: {
        cols: 1,
        can(x) { return player.inf.points.gte(this[x].cost()) },
        buy(x) {
            if (this.can(x)) {
                player.inf.points = player.inf.points.sub(this[x].cost())
                player.inf_rep_upgs[x] = player.inf_rep_upgs[x].add(1)
            }
        },
        buyMax() {
            for (let x = 1; x <= this.cols; x++) if (this.can(x)) {
                let bulk = this[x].bulk()
                if (bulk.gt(player.rep_upgs[x])) {
                    player.replicanti = player.replicanti.sub(this[x].cost(bulk.sub(1)))
                    player.rep_upgs[x] = bulk
                }
            }
        },
        1: {
            id: 1,
            title: "Infinity Replicanti Multiplier",
            cost(x=player.inf_rep_upgs[this.id]) { return E(1.5).pow(x.pow(1.5)).floor() },
            effect(x=player.inf_rep_upgs[this.id]) {
                let lvl = x
                return lvl.mul(0.01).add(1)
            },
            desc(eff=this.effect()) { return `Multiple Infinity Replicanti growth by ${format(eff)}x.` },
            bulk(x=player.replicanti) {
                if (x.lt(1)) return E(0)
                let bulk = x.logBase(1.5).root(1.5).add(1).floor()
                return bulk
            },
        },
    }
}