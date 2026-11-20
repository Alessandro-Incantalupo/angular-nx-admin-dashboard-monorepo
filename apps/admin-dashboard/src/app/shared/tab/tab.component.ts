import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
@Component({
  selector: 'app-tab',
  imports: [],
  templateUrl: './tab.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  readonly tabs = input<{ name: string; icon?: any; disabled?: boolean }[]>([]);
  readonly activeTab = input<string>('');
  readonly tabChange = output<string>();

  onTabClick(tabName: string) {
    const tab = this.tabs().find(t => t.name === tabName);
    if (!tab?.disabled) {
      this.tabChange.emit(tabName);
    }
  }
}
