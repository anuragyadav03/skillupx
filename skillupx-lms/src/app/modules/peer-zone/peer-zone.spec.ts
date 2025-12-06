import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerZone } from './peer-zone';

describe('PeerZone', () => {
  let component: PeerZone;
  let fixture: ComponentFixture<PeerZone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeerZone]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeerZone);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
