import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGrupo } from './dashboard-group';

describe('DashboardGrupo', () => {
  let component: DashboardGrupo;
  let fixture: ComponentFixture<DashboardGrupo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGrupo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGrupo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
