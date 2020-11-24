import { Component, OnInit, NgModule } from '@angular/core';

@Component({
  selector: 'apls-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

@NgModule({
  declarations: [
    PreloaderComponent,
  ],
  exports: [
    PreloaderComponent
  ]
})
export class AplsPreloaderModule {}
