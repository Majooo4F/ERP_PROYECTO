import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionService } from '../services/permission.service';
import { HasPermissionDirective } from './has-permission.directive';

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `<div *ifHasPermission="'user:view'" data-testid="content">OK</div>`
})
class HostComponent {}

describe('HasPermissionDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: PermissionService,
          useValue: { hasAnyPermission: () => true, getPermissions: () => [] }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should render when permission is granted', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="content"]')).toBeTruthy();
  });
});
