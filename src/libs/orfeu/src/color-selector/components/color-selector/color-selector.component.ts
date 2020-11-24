import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { IColorSelectorConfig } from '../../color-selector-config';
import { IColor, PaletteDirection } from '../../interfaces';
import { AplsColorSelectorService } from '../../services/';

@Component({
  selector: 'apls-color-selector',
  templateUrl: 'color-selector.component.html',
  styleUrls: ['./color-selector.component.scss'],
  providers: [AplsColorSelectorService],
  host: {
    '[style.height.px]': 'height',
    '[style.width.px]': 'width'
  }
})
export class AplsColorSelectorComponent implements OnInit {
  public paletteDirection = PaletteDirection;

  private _color: IColor = { hex: '#000' };
  @Input()
  set color(color: IColor) {
    this.colorSelectorService.currentColor = color;

    if (!!color) {
      this.change.emit(color);
    }
  }

  get color() {
    return this._color;
  }

  @Output() change = new EventEmitter<IColor>();

  @Output() colorChange = new EventEmitter<IColor>();

  @Input() options: IColorSelectorConfig;

  public showPalette: boolean = false;

  public height: number;
  public width: number;

  constructor(private elementRef: ElementRef, private colorSelectorService: AplsColorSelectorService) {
    this.colorSelectorService.currentColor$.subscribe((color: IColor) => {
      this._color = color;
      this.colorChange.next(color);
      this.showPalette = false;
    });

    this.height = this.colorSelectorService.config.itemSize.height;
    this.width = this.colorSelectorService.config.itemSize.width;
  }

  ngOnInit() {
    if (this.options) {
      this.colorSelectorService.config = this.options;
    }
  }

  @HostListener('document:click', ['$event'])
  clickOff() {
    if (!this.showPalette) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showPalette = false;
    }
  }

  public togglePalette() {
    this.showPalette = !this.showPalette;
  }
}
