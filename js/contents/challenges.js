const CHALS = {
    types: ['normal','inf'],
    onChal(x) { return player.chals.active == x },
    enter(ch, id) {
        if (player.chals.active == "") {
            player.chals.active = ch + id
            this[ch].onEnter()
        }
    },
    exit() {
        if (player.chals.active != "") {
            let ch = ""
            for (let x = 0; x < this.types.length; x++) {
                if (player.chals.active.includes(this.types[x])) {
                    ch = this.types[x]
                    break
                }
            }
            this[ch].onEnter()
            player.chals.active = ""
        }
    },
    normal: {
        btnMsg(x) { return player.chals.active == "normal"+x ? "Running" : (player.chals.comps.includes("normal"+x) ? "Completed" : "Start") },
        onEnter() {
            FORMS.inf.onReset()
        },
        length: 6,
        1: {
            unl() { return true },
            desc: "Replicanti Penalty is 50% stronger.",
            reward: "Unlock Replicanti Storage autobuyer.",
        },
        2: {
            unl() { return true },
            desc: "You cannot buy Replicanti Multiplier, and Replicanti growth starts 2x.",
            reward: "Unlock Replicanti Multiplier autobuyer.",
        },
        3: {
            unl() { return true },
            desc: "Replicanti Multiplier/Power scales stronger.",
            reward: "Unlock Replicanti Power autobuyer.",
        },
        4: {
            unl() { return true },
            desc: "Repeated Replicanti boost Replicanti Multiplier/Power instead of Replicanti Storage, but Repeated Replicanti are 4x stronger.",
            reward: "Unlock Repeated Replicanti autobuyer.",
        },
        5: {
            unl() { return true },
            desc: "Replicanti Galaxy scales stronger.",
            reward: "Unlock Replicanti Galaxy autobuyer.",
        },
        6: {
            unl() { return true },
            desc: "Prestige points gain are raised by 0.85.",
            reward: "You gain 100% of your Prestige points gained on reset each second.",
        },
    },
}