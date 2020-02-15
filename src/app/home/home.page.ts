import { Component, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import {ToastController} from '@ionic/angular'; 
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  devices:any=[];
  Showid:string="0";
  PJMaskid:string="1";
  Speed:string="35";
  Brightness:string="100";
  ShowCharacteristicUUID:string="19B10001-E8F2-537E-4F6C-D104768A1214";
  PJMaskCharacteristicUUID:string="19B10001-E8F2-537E-4F6C-D104768A1215";
  SpeedCharacteristicUUID:string="19B10001-E8F2-537E-4F6C-D104768A1217";
  BrightnessCharacteristicUUID:string="19B10001-E8F2-537E-4F6C-D104768A1216";
  Statusconnection:boolean=false;
  Statusconnectionlabel:string="";
  ConnectedDeviceId:string="";


  constructor(private ble: BLE,private ngZone: NgZone,private toast: ToastController) {}

  async presentToast(msg) {
    let toast = await  this.toast.create({
      message: msg,
      duration: 1000,
      position: 'top'
    });
    await toast.present();
  }

 
  scan() {
    this.Statusconnectionlabel="...tentativo di connessione..."
    this.devices = [];  // clear list

    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );
    
  }
  onDeviceDiscovered(device) {
    var adData = new Uint8Array(device.advertising)
    if(device.name=="PJMASKNANO"){
      console.log('Discovered ' + JSON.stringify(device, null, 2));
      console.log('Adv ' + JSON.stringify(adData, null, 2));
     
          this.devices.push(device);
          this.ble.connect(device.id).subscribe( 
          connectCallBack=>this.connectCallBack(connectCallBack,device),
          disconnectCallback=>this.disconnectCallback(disconnectCallback)
          
          )
            
     
    }
  }
  connectCallBack(complex,device){
    this.presentToast("CONNESSIONE RIUSCITA");
    this.Statusconnectionlabel="CONNESSO";
    this.Statusconnection=true;
    this.ConnectedDeviceId=device.id;
    console.log('complex'+JSON.stringify(complex, null, 2))
    for(var i=0; i<complex.characteristics.length; i++){
      var CharacteristicName=null;
      switch(complex.characteristics[i].characteristic){
        case  this.ShowCharacteristicUUID:
          CharacteristicName="Showid";
          break;
        case this.PJMaskCharacteristicUUID:
          CharacteristicName="PJMaskid";
          break;  
      }
     
      this.ble.read(complex.id,complex.characteristics[i].service,complex.characteristics[i].characteristic).then(
        
          data=>this.readCharacteristicValue(data,CharacteristicName)
        
        );
          
      
    }

  }
  disconnectCallback(complex){

  }
  readCharacteristicValue(data,CharacteristicName){
  
    this.ngZone.run(() => {
      switch (CharacteristicName){
        case "Showid":
          this.Showid=String.fromCharCode.apply(null, new Uint8Array(data));
          break;
        case "PJMaskid":
            this.PJMaskid=String.fromCharCode.apply(null, new Uint8Array(data));
          break;  
      //this.ble.disconnect(device.id);
      }
    });
    //
    

  }

    // If location permission is denied, you'll end up here
    scanError(error) {
    
      /*let toast = this.toastCtrl.create({
        message: 'Error scanning for Bluetooth low energy devices',
        position: 'middle',
        duration: 5000
      });
      toast.present();*/
      console.log(error);
    }

    setShow(value){
      this.Showid=value;
      var byteArray=this.stringToBytes(value);
      this.ble.write(this.ConnectedDeviceId,"19b10000-e8f2-537e-4f6c-d104768a1214",this.ShowCharacteristicUUID,byteArray).then(
        result=> {
        }).catch(error=> {
            alert(JSON.stringify(error));
        });
    }

    setPjmask(value){
      var byteArray=this.stringToBytes(value);
      this.ble.write(this.ConnectedDeviceId,"19b10000-e8f2-537e-4f6c-d104768a1214",this.PJMaskCharacteristicUUID,byteArray).then(
        result=> {
        }).catch(error=> {
            alert(JSON.stringify(error));
        });
    }

    setSpeed(){

      var byteArray=this.stringToBytes((256-parseInt(this.Speed)).toString());//il metodo ritorna un array buffer come richiesto da ble.write
      this.ble.write(this.ConnectedDeviceId,"19b10000-e8f2-537e-4f6c-d104768a1214",this.SpeedCharacteristicUUID,byteArray).then(
        result=> {
        }).catch(error=> {
            alert(JSON.stringify(error));
        });
    }
    setBrightness(){

      var byteArray=this.stringToBytes(this.Brightness.toString());//il metodo ritorna un array buffer come richiesto da ble.write
      this.ble.write(this.ConnectedDeviceId,"19b10000-e8f2-537e-4f6c-d104768a1214",this.BrightnessCharacteristicUUID,byteArray).then(
        result=> {
        }).catch(error=> {
            alert(JSON.stringify(error));
        });
    }
    
   stringToBytes(string) {
    var array = new Uint8Array(1);//unsignedInt come nel codice Arduino PJMaskNanoBleSense
    array[0] = parseInt(string);
    return array.buffer;//trasforma il typed array in array buffer
 }
}


