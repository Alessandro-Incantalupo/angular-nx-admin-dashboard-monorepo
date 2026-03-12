import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { ClickOutsideRxjsDirective } from '@shared/directives/click-outside-rxjs.directive';

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
] as const;

@Component({
  selector: 'app-lang-switcher',
  imports: [ClickOutsideRxjsDirective],
  templateUrl: './lang-switcher.component.html',
  host: { class: 'relative' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangSwitcherComponent {
  private readonly transloco = inject(TranslocoService);

  readonly languages = LANGUAGES;
  readonly isOpen = signal(false);

  readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  readonly activeLanguage = computed(
    () => LANGUAGES.find(l => l.code === this.activeLang()) ?? LANGUAGES[0]
  );

  toggle() {
    this.isOpen.update(v => !v);
  }

  setLang(code: string) {
    this.transloco.setActiveLang(code);
    this.isOpen.set(false);
  }
}
