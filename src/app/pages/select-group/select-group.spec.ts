import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { GrupoSelector } from './select-group';

describe('GrupoSelector', () => {
  let component: GrupoSelector;
  let fixture: ComponentFixture<GrupoSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoSelector],
      providers: [{ provide: Router, useValue: { navigate: () => Promise.resolve(true) } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrupoSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
