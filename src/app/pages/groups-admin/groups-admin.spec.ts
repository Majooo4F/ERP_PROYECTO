import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupManagementComponent } from './groups-admin';

describe('GroupsAdmin', () => {
  let component: GroupManagementComponent;
  let fixture: ComponentFixture<GroupManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
