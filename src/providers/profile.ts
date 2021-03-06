import {
  Component,
  ElementRef,
  ViewChild,
  Renderer,
  NgZone,
  Injectable } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';

// Pages
import { LogInPage } from '../pages/log-in/log-in';

// Providers
import { Auth } from '../providers/auth';
import { Tools } from '../providers/tools';
import { SlideAvatar } from '../providers/slide-avatar';
import { User } from '../providers/user';
import { UndercoverProvider } from '../providers/undercover';

import { Keyboard } from '@ionic-native/keyboard';

// Custom libs
import { MessageDateTimer } from '../includes/messagedatetimer';

@Injectable()
export class Profile {

  public userName: string;
  public userDescription: string;
  public user: any;
  public profileTypePublic: boolean;
  public imageLoading: boolean = false;
  private pageTag: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public renderer: Renderer,
    private keyboard: Keyboard,
    public tools: Tools,
    public slideAvatarPrvd: SlideAvatar,
    public auth: Auth,
    public userPrvd: User,
    public undercoverPrvd: UndercoverProvider,
    public zone: NgZone,
    elRef: ElementRef
  ) {
    this.pageTag = elRef.nativeElement.tagName.toLowerCase();
    this.profileTypePublic = this.navParams.get('public');
    this.user = this.auth.getAuthData();
    if (!this.user) this.user = {
      avatar_content_type: null,
      avatar_file_name: null,
      avatar_file_size: null,
      avatar_updated_at: null,
      avatar_url: 'assets/images/incognito.png',
      created_at: '2017-04-22T14:59:29.921Z',
      date_of_birthday: '2004-01-01',
      email: 'olbachinskiy2@gmail.com',
      name: 'Oleksandr Bachynskyi',
      id: 55,
      invitation_sent: false,
      phone: '1492873128682',
      provider_id: null,
      provider_name: null,
      role_description: null,
      role_image_url: 'assets/images/incognito.png',
      role_name: null,
      hero_avatar_url: null,
      updated_at: '2017-04-22T14:59:29.921Z',
    }
  }

  public filesAdded(event): void {
    console.log('event:', event);
    this.tools.showLoader();
    let files: FileList = (<HTMLInputElement>event.target).files;
    console.log('files:', files);
    let userId = this.user.id;
    let fieldName: string;
    let tempFiles = [];

    console.log('[ProfileSettingPage][filesAdded]', this.slideAvatarPrvd.sliderPosition);
    if (this.slideAvatarPrvd.sliderPosition == 'right') {
      fieldName = 'hero_avatar';
    } else {
      fieldName = 'avatar';
    }

    for (let i = 0; i < files.length; i++) {
      tempFiles.push(files.item(i));
    }
    console.log('tempFiles:', tempFiles);
    if (tempFiles.length > 0) {
      this.userPrvd.updateAvatar(userId, tempFiles, null, fieldName).then(res => {
        console.log('[updateAvatar] res:', res);
        this.imageLoading = false;
        // this.tools.hideLoader();
        this.user = res;
        this.saveChanges('noloader');
        // this.user.avatar_url = this.auth.hostUrl + this.user.avatar_url;
      }, err => {
        this.tools.hideLoader();
        console.error('updateAvatar ERROR', err);
        this.imageLoading = false;
      });
    } else {
      console.warn('tempFiles length is:', tempFiles.length);
      console.warn('tempFiles:', tempFiles);
      this.tools.hideLoader();
      this.imageLoading = false;
    }
  }

  public changeCallback(positionLeft: boolean) {
    this.zone.run(() => {
      if (positionLeft) {
        this.undercoverPrvd.profileType = 'public';
        this.profileTypePublic = true;
      } else {
        this.undercoverPrvd.profileType = 'undercover';
        this.profileTypePublic = false;
      }

      this.userName = this.slideAvatarPrvd.sliderPosition == 'left'
        ? this.user.name
        : this.user.role_name;
      this.userDescription = this.user.role_description;

      this.saveChanges();
    });
    return this.user;
  }

  public saveChanges(command?:string) {
    let showLoader: boolean = true;
    switch (command) {
      case 'noloader':
        showLoader = false;
        break;
    }
    if (showLoader)
      this.tools.showLoader();

    let params: any;
    console.log('slider position: ' + this.slideAvatarPrvd.sliderPosition);
    if (this.slideAvatarPrvd.sliderPosition == 'right') {
      if (this.userName && this.userDescription)
      params = {
        user: {
          role_name: this.userName,
          role_description: this.userDescription,
        }
      }
    } else {
      if (this.userName)
        params = { user: { name: this.userName } }
    }

    if (params)
      this.userPrvd.update(this.user.id, params, this.auth.getAuthType())
      .map(res => res.json()).subscribe(res => {
        console.log('[user provider] (Update) res:', res);
        this.user = res;
        this.tools.hideLoader();
        // this.user.avatar_url = this.auth.hostUrl + this.user.avatar_url;
      }, err => {
        console.error(err);
        this.tools.hideLoader();
      });
  }

  public saveChangesOnLeave() {
    this.slideAvatarPrvd.changeCallback = null;
    this.saveChanges();
  }

  logOut() {
    this.auth.logout();
    this.tools.pushPage(LogInPage);
  }
}
