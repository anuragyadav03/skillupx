import { Component } from '@angular/core';
import { AuthRoutingModule } from "./auth-routing-module";

@Component({
  selector: 'app-auth-layout',
  imports: [AuthRoutingModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss'
})
export class AuthLayout {

}
