import { resolve } from 'dns';
import { BufferGeometry, Geometry, LoadingManager, Material, SkinnedMesh } from 'three';
import { MMDLoader } from '../libs/MMDLoader'
export class ModelClass{
    public id:number;
    public url:string;
    public mesh: SkinnedMesh | null;
    public modelName: string | null;
    constructor(id:number, url: string){
        this.id = id;
        this.url = url;
        this.mesh = null;
        this.modelName = null;
    }
    async loadMMD(url:string): Promise<Boolean>{
        return new Promise(resolve => {
            this.url = url;
            const loader = new MMDLoader();
            try {
                loader.load(this.url,(mesh) => {
                    this.mesh = mesh;
                    // @ts-ignore
                    const mmdData:any = mesh.geometry.userData.MMD;
                    this.modelName = mmdData.modelName;
                    resolve(true);
                });
            } catch(e) {
                console.error(e);
                resolve(false);
            }
        })
    }
}
