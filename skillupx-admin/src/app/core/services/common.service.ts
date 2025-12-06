import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  map,
  Observable,
  of,
  tap,
  throwError,
} from "rxjs";
import { environment } from "../../../environment/environtment";
import { HttpClient, HttpHeaders } from "@angular/common/http";

// ----------- INTERFACES -----------
export interface UserInfo {
  name: string;
  email: string;
  username?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: UserInfo;
}

@Injectable({
  providedIn: "root",
})
export class CommonService {
  private apiUrl = environment.apiUrl;

  // ---------- STATE MANAGEMENT ----------
  $userInfo = new BehaviorSubject<Partial<UserInfo>>({});
  $isLoggedIn = new BehaviorSubject<boolean>(false);
  $username = new BehaviorSubject<string>("");

  constructor(private http: HttpClient) {
    this.restoreState();
  }

  // -------------------------------------
  // RESTORE LOCAL STORAGE STATE
  // -------------------------------------
  private restoreState() {
    // LOGIN STATUS
    const savedLogin = localStorage.getItem("isLoggedIn");
    if (savedLogin) this.$isLoggedIn.next(savedLogin === "true");

    // USER INFO
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) this.$userInfo.next(JSON.parse(savedUser));

    // USERNAME
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) this.$username.next(savedUsername);
  }

  // -------------------------------------
  // Helper: build auth options (headers) if token present
  // -------------------------------------
  private authOptions(): { headers?: HttpHeaders } {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // -------------------------------------
  // SIGNUP
  // -------------------------------------
  validateSignUp(
    name: string,
    email: string,
    password: string,
    phone: string
  ): Observable<LoginResponse> {
    const body = { name, email, password, phone };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/signup`, body).pipe(
      map((response) => response),
      catchError((error) => {
        console.error("Signup error:", error);
        return throwError(() => error);
      })
    );
  }

  // -------------------------------------
  // LOGIN
  // -------------------------------------
  validateLogin(email: string, password: string): Observable<UserInfo | null> {
    const body = { email, password };

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, body)
      .pipe(
        tap((response) => {
          if (response && response.user) {
            const user = response.user;

            this.$isLoggedIn.next(true);
            this.$userInfo.next(user);
            this.$username.next(user.username ?? "");

            // Store login session
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("token", response.token);
            localStorage.setItem("userInfo", JSON.stringify(user));
            localStorage.setItem("username", user.username ?? "");
          }
        }),
        map((response) => (response.user ? response.user : null)),
        catchError((err) => {
          console.error("Login failed:", err);
          return of(null); // return null instead of throwing error
        })
      );
  }

  // -------------------------------------
  // CHECK LOGIN
  // -------------------------------------
  checkLoginStatus(): Observable<boolean> {
    return this.$isLoggedIn.asObservable();
  }

  // -------------------------------------
  // GET PROFILE
  // -------------------------------------
  async getProfile(username: string): Promise<UserInfo> {
    try {
      const body = { username };

      const response: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/getdetails`, body, this.authOptions())
      );

      const data = response.data;
      const userInfo: UserInfo = {
        name: data.name,
        email: data.email,
        username: data.username,
      };

      this.$userInfo.next(userInfo);
      this.$username.next(userInfo.username ?? "");

      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("username", userInfo.username ?? "");

      return userInfo;
    } catch (err) {
      console.error("Error loading profile:", err);
      throw new Error("Failed to load user profile");
    }
  }

  // -------------------------------------
  // UPDATE PROFILE
  // -------------------------------------
  async updateProfile(updatedData: any): Promise<string> {
    try {
      const response: any = await firstValueFrom(
        this.http.put(`${this.apiUrl}/auth/updatedetails`, updatedData, this.authOptions())
      );

      if (response.success) {
        const updated = {
          ...this.$userInfo.getValue(),
          ...updatedData,
        };

        this.$userInfo.next(updated);

        if (updatedData.username) {
          this.$username.next(updatedData.username);
          localStorage.setItem("username", updatedData.username);
        }

        localStorage.setItem("userInfo", JSON.stringify(updated));

        return response.message || "Profile updated successfully";
      }

      return response.message || "Update failed";
    } catch (err) {
      console.error("Update failed:", err);
      return "Update failed. Please try again.";
    }
  }

  // -------------------------------------
  // USER SEARCH (partial)
  // -------------------------------------
  /**
   * Search users by partial query (email / phone / name).
   * Returns Observable of user array (empty array on short query or error).
   */
  searchUsers(query: string): Observable<any[]> {
    const q = (query || "").trim();
    if (!q || q.length < 2) {
      return of([]);
    }

    const url = `${this.apiUrl}/users/search?q=${encodeURIComponent(q)}`;
    return this.http.get<{ users: any[] }>(url, this.authOptions()).pipe(
      map((res) => res.users || []),
      catchError((err) => {
        console.error("User search failed:", err);
        return of([]); // return empty list on error
      })
    );
  }

  // -------------------------------------
  // LOGOUT
  // -------------------------------------
  logout(): void {
    // CLEAR STATE
    this.$isLoggedIn.next(false);
    this.$userInfo.next({});
    this.$username.next("");

    // CLEAR STORAGE
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("username");
  }
}
