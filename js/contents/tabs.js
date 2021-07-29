const TABS = {
    choose(x, stab=false) {
        if (!stab && player.tab[0] != x) player.tab[1] = 0
        player.tab[stab?1:0] = x
    },
    1: [
        { id: "Replicanti" },
        { id: "Options" },
        { id: "Statistics" },
        { id: "Achievements" },
        { id: "Infinity", seen() { return FORMS.inf.seen() }, style: "inf" },
        { id: "Eternity", unl() { return FORMS.inf.seen() }, seen() { return false }, style: "eter" },
    ],
    2: {
        0: [
            { id: "Replicanti" },
            { id: "Prestige", seen() { return FORMS.prestige.seen() }, style: "prestige" },
        ],
        4: [
            { id: "Infinity Replicanti" },
        ],
    },
}