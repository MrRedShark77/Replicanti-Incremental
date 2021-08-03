function E(x){return new ExpantaNum(x)};
function ex(x){
    let nx = new E(0);
    nx.array = x.array;
    nx.sign = x.sign;
    nx.layer = x.layer;
    return nx;
}

ExpantaNum.prototype.softcap = function (start,force,mode){
    var x = this.clone()
    if (x.lt(start)) return x
    if([0,"pow"].includes(mode)) x = x.div(start).pow(force).mul(start).min(x)
    if([1,"mul"].includes(mode)) x = x.sub(start).div(force).add(start).min(x)
    return x
}

function calc(dt) {
    player.stats.fast_grow = FORMS.replicanti.growth().max(player.stats.fast_grow)
    if (!FORMS.inf.reached()) {
        let grow = player.replicanti.mul(FORMS.replicanti.growth().pow(dt))
        player.replicanti = grow
    }
    player.stats.best_rep = player.replicanti.max(player.stats.best_rep)

    let inf_grow = player.inf.replicanti.mul(FORMS.inf.replicanti.growth().pow(dt))
    if (inf_grow.gte(1e10)) player.inf.replicanti = E(1e10)
    else player.inf.replicanti = inf_grow

    player.time += dt
    player.inf.time += dt

    if (player.chals.comps.includes("normal6")) player.prestige.points = player.prestige.points.add(FORMS.prestige.gain().mul(dt))

    AUTOS.update()
    ACHS.checkACHS()
}

const PLAYER_DATA = {
    replicanti: E(1),
    rep_galaxy: E(0),
    stats: {
        best_rep: E(1),
        fast_grow: E(1),
    },
    rep_upgs: {},
    inf_rep_upgs: {},
    time: 0,
    prestige: {
        unl: false,
        points: E(0),
        upgrades: [],
    },
    inf: {
        time: 0,
        best: 999999999,
        points: E(0),
        times: E(0),
        replicanti: E(1),
        comp: E(0),
        upgrades: [],
    },
    achs: [],
    chals: {
        active: "",
        comps: [],
    },
    autobuyer: {},
    breakInf: false,
}

function wipe() {
    player = PLAYER_DATA
    for (let x = 1; x <= UPGS.replicanti.cols; x++) player.rep_upgs[x] = E(0)
    for (let x = 1; x <= AUTOS.length; x++) player.autobuyer[AUTOS[x].id] = false
}

function loadPlayer(load) {
    player = load
    checkIfUndefined()
    convertToExpNum()
    player.tab = [0,0]
}

function checkIfUndefined() {
    const data = PLAYER_DATA
    for (let x = 0; x < Object.keys(data).length; x++) {
        let key = Object.keys(data)[x]
        if (player[key] === undefined) player[key] = data[key]
    }

        // Replicanti Upgrades
    for (let x = 1; x <= UPGS.replicanti.cols; x++) if (player.rep_upgs[x] === undefined) player.rep_upgs[x] = E(0)
    for (let x = 1; x <= UPGS.inf_rep.cols; x++) if (player.inf_rep_upgs[x] === undefined) player.inf_rep_upgs[x] = E(0)

        // Prestige
    for (let x = 0; x < Object.keys(data.prestige).length; x++) {
        let key = Object.keys(data.prestige)[x]
        if (player.prestige[key] === undefined) player.prestige[key] = data.prestige[key]
    }

        // Statistics
    for (let x = 0; x < Object.keys(data.stats).length; x++) {
        let key = Object.keys(data.stats)[x]
        if (player.stats[key] === undefined) player.stats[key] = data.stats[key]
    }

        // Infinity
    for (let x = 0; x < Object.keys(data.inf).length; x++) {
        let key = Object.keys(data.inf)[x]
        if (player.inf[key] === undefined) player.inf[key] = data.inf[key]
    }

        // Challenges
    for (let x = 0; x < Object.keys(data.chals).length; x++) {
        let key = Object.keys(data.chals)[x]
        if (player.chals[key] === undefined) player.chals[key] = data.chals[key]
    }

        // Autobuyers
    for (let x = 1; x <= AUTOS.length; x++) if (player.autobuyer[AUTOS[x].id] == undefined) player.autobuyer[AUTOS[x].id] = false
}

function convertToExpNum() {
    player.replicanti = ex(player.replicanti)
    player.rep_galaxy = ex(player.rep_galaxy)
    for (let x = 1; x <= UPGS.replicanti.cols; x++) player.rep_upgs[x] = ex(player.rep_upgs[x])
    for (let x = 1; x <= UPGS.inf_rep.cols; x++) player.inf_rep_upgs[x] = ex(player.inf_rep_upgs[x])
    player.prestige.points = ex(player.prestige.points)

    player.stats.best_rep = ex(player.stats.best_rep)
    player.stats.fast_grow = ex(player.stats.fast_grow)

    player.inf.points = ex(player.inf.points)
    player.inf.times = ex(player.inf.times)
    player.inf.replicanti = ex(player.inf.replicanti)
    player.inf.comp = ex(player.inf.comp)
}

function save(){
    if (localStorage.getItem("ReplicantiIncrementalSave") == '') wipe()
    localStorage.setItem("ReplicantiIncrementalSave",btoa(JSON.stringify(player)))
}

function load(x){
    if(typeof x == "string" & x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe()
    }
}

function exporty() {
    save();
    let file = new Blob([btoa(JSON.stringify(player))], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Replicanti Incremental Save.txt"
    a.click()
}

function importy() {
    let loadgame = prompt("Paste in your save WARNING: WILL OVERWRITE YOUR CURRENT SAVE")
    if (loadgame != null) {
        load(loadgame)
        location.reload()
    }
}

function loadGame() {
    wipe()
    load(localStorage.getItem("ReplicantiIncrementalSave"))
    loadVue()
    setInterval(save,1000)
}