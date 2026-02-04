import requests
import sys
import json
from datetime import datetime

class LASAMBUSAPITester:
    def __init__(self, base_url="https://ems-portal-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    details = f"Status: {response.status_code}"
                except:
                    response_data = {}
                    details = f"Status: {response.status_code} (No JSON response)"
            else:
                try:
                    error_detail = response.json().get('detail', 'Unknown error')
                    details = f"Expected {expected_status}, got {response.status_code} - {error_detail}"
                except:
                    details = f"Expected {expected_status}, got {response.status_code}"
                response_data = {}

            self.log_test(name, success, details)
            return success, response_data

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration for both personnel and admin"""
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Test personnel registration
        personnel_data = {
            "email": f"personnel_{timestamp}@lasambus.com",
            "password": "TestPass123!",
            "full_name": f"Test Personnel {timestamp}",
            "role": "personnel"
        }
        
        success, response = self.run_test(
            "Personnel Registration",
            "POST",
            "auth/register",
            200,
            data=personnel_data
        )
        
        if success:
            self.personnel_email = personnel_data["email"]
            self.personnel_password = personnel_data["password"]
        
        # Test admin registration
        admin_data = {
            "email": f"admin_{timestamp}@lasambus.com",
            "password": "AdminPass123!",
            "full_name": f"Test Admin {timestamp}",
            "role": "admin"
        }
        
        success, response = self.run_test(
            "Admin Registration",
            "POST",
            "auth/register",
            200,
            data=admin_data
        )
        
        if success:
            self.admin_email = admin_data["email"]
            self.admin_password = admin_data["password"]
        
        return success

    def test_user_login(self, email, password, role_name):
        """Test user login"""
        login_data = {
            "email": email,
            "password": password
        }
        
        success, response = self.run_test(
            f"{role_name} Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_incident_creation(self):
        """Test incident creation"""
        incident_data = {
            "patient_name": "John Doe",
            "patient_age": 35,
            "patient_sex": "Male",
            "location": "Victoria Island",
            "lga": "Lagos Island",
            "description": "Traffic accident with minor injuries",
            "action_taken": "First aid administered, vitals checked",
            "transfer_to_hospital": False
        }
        
        success, response = self.run_test(
            "Create Incident",
            "POST",
            "incidents",
            200,
            data=incident_data
        )
        
        if success and 'id' in response:
            self.incident_id = response['id']
            return True
        return False

    def test_get_incidents(self):
        """Test fetching incidents"""
        success, response = self.run_test(
            "Get Incidents",
            "GET",
            "incidents",
            200
        )
        
        if success and isinstance(response, list):
            return len(response) > 0
        return False

    def test_get_hospitals(self):
        """Test fetching hospitals"""
        success, response = self.run_test(
            "Get Hospitals",
            "GET",
            "hospitals",
            200
        )
        
        if success and isinstance(response, list):
            # Check if hospitals have required fields
            if len(response) > 0:
                hospital = response[0]
                required_fields = ['id', 'name', 'address', 'lga', 'available_beds', 'expertise', 'phone']
                has_all_fields = all(field in hospital for field in required_fields)
                self.log_test("Hospital Data Structure", has_all_fields, 
                            f"Hospital has all required fields: {has_all_fields}")
                return has_all_fields
            return True
        return False

    def test_nearby_hospitals(self):
        """Test nearby hospitals endpoint"""
        # Test with Lagos coordinates
        success, response = self.run_test(
            "Get Nearby Hospitals",
            "GET",
            "hospitals/nearby?lat=6.5244&lon=3.3792&condition=emergency",
            200
        )
        
        if success and isinstance(response, list):
            return True
        return False

    def test_lga_coverage(self):
        """Test if all Lagos LGAs are covered in the system"""
        expected_lgas = [
            'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
            'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
            'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
            'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
        ]
        
        success, hospitals = self.run_test(
            "Get Hospitals for LGA Check",
            "GET",
            "hospitals",
            200
        )
        
        if success:
            hospital_lgas = set(h['lga'] for h in hospitals)
            covered_lgas = len(hospital_lgas.intersection(expected_lgas))
            total_lgas = len(expected_lgas)
            
            coverage_success = covered_lgas >= 5  # At least 5 LGAs should have hospitals
            self.log_test("LGA Hospital Coverage", coverage_success, 
                        f"Hospitals in {covered_lgas}/{total_lgas} LGAs")
            return coverage_success
        return False

    def test_incident_update_patch(self):
        """Test the PATCH endpoint for updating incidents with hospital transfer"""
        if not hasattr(self, 'incident_id') or not self.incident_id:
            self.log_test("PATCH Incident Update", False, "No incident ID available for testing")
            return False
        
        # Test updating incident with hospital transfer
        update_data = {
            "transfer_to_hospital": True,
            "hospital_id": "hosp-1"  # LASUTH
        }
        
        success, response = self.run_test(
            "PATCH Incident Update",
            "PATCH",
            f"incidents/{self.incident_id}",
            200,
            data=update_data
        )
        
        if success:
            # Verify the response contains updated fields
            if response.get('transfer_to_hospital') == True and response.get('hospital_id') == "hosp-1":
                self.log_test("PATCH Response Validation", True, "Updated fields returned correctly")
                return True
            else:
                self.log_test("PATCH Response Validation", False, "Updated fields not returned correctly")
                return False
        return False

    def test_authentication_required(self):
        """Test that protected endpoints require authentication"""
        # Temporarily remove token
        old_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Incidents Without Auth",
            "GET",
            "incidents",
            401
        )
        
        # Restore token
        self.token = old_token
        return success

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting LASAMBUS API Test Suite")
        print("=" * 50)
        
        # Test registration
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
        
        # Test personnel login
        if not self.test_user_login(self.personnel_email, self.personnel_password, "Personnel"):
            print("❌ Personnel login failed, stopping tests")
            return False
        
        # Test incident creation (as personnel)
        if not self.test_incident_creation():
            print("❌ Incident creation failed")
        
        # Test get incidents (as personnel)
        self.test_get_incidents()
        
        # Test admin login
        if not self.test_user_login(self.admin_email, self.admin_password, "Admin"):
            print("❌ Admin login failed")
        
        # Test get incidents (as admin - should see all incidents)
        self.test_get_incidents()
        
        # Test PATCH endpoint for incident updates (CRITICAL FIX)
        self.test_incident_update_patch()
        
        # Test hospitals
        self.test_get_hospitals()
        self.test_nearby_hospitals()
        self.test_lga_coverage()
        
        # Test authentication
        self.test_authentication_required()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = LASAMBUSAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%",
                'timestamp': datetime.now().isoformat()
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())