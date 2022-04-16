export interface PeopleBody {
  id: string;
  pid: string;
  fullname: string;
  gender: string;
  place_of_birth: string;
  date_of_birth: Date;
  address: string;
  religion: Object;
  profession: Object;
  media_social: Object;
  is_married: boolean;
  is_alive: boolean;
  has_driver_license: boolean;
  has_insurance: boolean;
  has_passport: boolean;
}
