import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborateurEditPopupComponent } from './collaborateur-edit-popup.component';

describe('CollaborateurEditPopupComponent', () => {
  let component: CollaborateurEditPopupComponent;
  let fixture: ComponentFixture<CollaborateurEditPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollaborateurEditPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollaborateurEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
