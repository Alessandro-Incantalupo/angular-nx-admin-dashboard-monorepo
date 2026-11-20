import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslocoMock, testingModuleZoneless } from '@test/utils';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await testingModuleZoneless({
      imports: [AppComponent],
      providers: [provideTranslocoMock()],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should run', () => {
    expect(true).toBe(true);
  });
});
