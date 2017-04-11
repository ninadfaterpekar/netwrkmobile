import { Injectable } from '@angular/core';

// Providers
import { LocalStorage } from './local-storage';
import { User } from './user';
import { Tools } from './tools';

@Injectable()
export class UndercoverProvider {
  public sliderState: boolean =  false;
  constructor(
    public localStorage: LocalStorage,
    public user: User,
    public tools: Tools
  ) {
    console.log('Hello Undercover Provider');
  }

  public getPerson(): any {
    return this.localStorage.get('undercover_person');
  }

  public setActivePerson(status: boolean): any {
    let person = this.getPerson();
    person ? person.active = status : person = { active: status };
    return this.localStorage.set('undercover_person', person);
  }

  public setPerson(person: any): any {
    let updateObj: any = {
      role_name: person.name,
      role_description: person.description,
      role_image_url: person.imageUrl,
      active: null,
    }

    return new Promise((resolve, reject) => {
      // this.tools.showLoader();
      // this.user.update(
      //   this.user.getAuthData().id,
      //   { user: updateObj }
      // ).map(res => res.json()).subscribe(res => {
      //   this.tools.hideLoader();
      //   person.active = true;
      //   this.localStorage.set('undercover_person', person);
      //   resolve(res);
      // }, err => {
      //   this.tools.hideLoader();
      //   this.tools.showToast(JSON.stringify(err));
      //   reject(err);
      // });
    });
  }
}
