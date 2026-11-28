import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslocoMock, testingModuleZoneless } from '@test/utils';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await testingModuleZoneless({
      imports: [AppComponent],
      providers: [provideTranslocoMock()],
    });
    fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
  });

  it('should run', () => {
    expect(true).toBe(true);
  });
});
