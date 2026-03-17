import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsGestion } from './groups-gestion';

describe('GroupsGestion', () => {
  let component: GroupsGestion;
  let fixture: ComponentFixture<GroupsGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsGestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsGestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
