class Info{
    constructor(name, id, score, org){
        this.name = name;
        this.id = id;
        this.score = score;
        this.org = org;
    }

    toJSON(){
        const ret = {
            "name": this.name,
            "id": this.id,
            "score": this.score,
            "org": this.org
        }

        return ret;
    }
}

export default Info; 