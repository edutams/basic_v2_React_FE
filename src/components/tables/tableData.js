import img1 from 'src/assets/images/users/1.jpg';
import img2 from 'src/assets/images/users/2.jpg';
import img3 from 'src/assets/images/users/3.jpg';
import img4 from 'src/assets/images/users/4.jpg';
import img5 from 'src/assets/images/users/5.jpg';


const basicsTableData = [
  {
    id: '1',
    imgsrc: img1,
    name: 'Sunil Joshi',
    post: 'Web Designer',
    pname: 'Elite Admin',
    teams: [
      {
        id: '1.1',
        color: 'secondary.main',
        text: 'S',
      },
      {
        id: '1.2',
        color: 'error.main',
        text: 'D',
      },
    ],
    status: 'Active',
    budget: '3.9',
  },
  {
    id: '2',
    imgsrc: img2,
    name: 'Andrew McDownland',
    post: 'Project Manager',
    pname: 'Real Homes WP Theme',
    teams: [
      {
        id: '2.1',
        color: 'primary.main',
        text: 'A',
      },
      {
        id: '2.2',
        color: 'warning.main',
        text: 'X',
      },
      {
        id: '2.3',
        color: 'secondary.main',
        text: 'N',
      },
    ],
    status: 'Pending',
    budget: '24.5',
  },
  {
    id: '3',
    imgsrc: img3,
    name: 'Christopher Jamil',
    post: 'Project Manager',
    pname: 'MedicalPro WP Theme',
    teams: [
      {
        id: '3.1',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Completed',
    budget: '12.8',
  },
  {
    id: '4',
    imgsrc: img4,
    name: 'Mathew Anderson',
    post: 'Frontend Engineer',
    pname: 'Hosting Press HTML',
    teams: [
      {
        id: '4.1',
        color: 'primary.main',
        text: 'Y',
      },
      {
        id: '4.2',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Active',
    budget: '2.4',
  },
  {
    id: '5',
    imgsrc: img5,
    name: 'Micheal Doe',
    post: 'Content Writer',
    pname: 'Helping Hands WP Theme',
    teams: [
      {
        id: '5.1',
        color: 'secondary.main',
        text: 'S',
      },
    ],
    status: 'Cancel',
    budget: '9.3',
  },
];

const EnhancedTableData = [
  {
    id: '1',
    imgsrc: img1,
    name: 'Sunil Joshi',
    email: 'sunil@gmail.com',
    pname: 'Elite Admin',
    teams: [
      {
        id: '1.1',
        color: 'secondary.main',
        text: 'S',
      },
      {
        id: '1.2',
        color: 'error.main',
        text: 'D',
      },
    ],
    status: 'Active',
    weeks: '11',
    budget: '3.9',
  },
  {
    id: '2',
    imgsrc: img2,
    name: 'Andrew McDownland',
    email: 'andrew@gmail.com',
    pname: 'Real Homes WP Theme',
    teams: [
      {
        id: '2.1',
        color: 'primary.main',
        text: 'A',
      },
      {
        id: '2.2',
        color: 'warning.main',
        text: 'X',
      },
      {
        id: '2.3',
        color: 'secondary.main',
        text: 'N',
      },
    ],
    status: 'Pending',
    weeks: '19',
    budget: '24.5',
  },
  {
    id: '3',
    imgsrc: img3,
    name: 'Christopher Jamil',
    email: 'jamil@gmail.com',
    pname: 'MedicalPro WP Theme',
    teams: [
      {
        id: '3.1',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Completed',
    weeks: '30',
    budget: '12.8',
  },
  {
    id: '4',
    imgsrc: img4,
    name: 'Mathew Anderson',
    email: 'nirav@gmail.com',
    pname: 'Hosting Press HTML',
    teams: [
      {
        id: '4.1',
        color: 'primary.main',
        text: 'Y',
      },
      {
        id: '4.2',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Active',
    weeks: '40',
    budget: '2.4',
  },
  {
    id: '5',
    imgsrc: img5,
    name: 'Micheal Doe',
    email: 'micheal@gmail.com',
    pname: 'Helping Hands WP Theme',
    teams: [
      {
        id: '5.1',
        color: 'secondary.main',
        text: 'S',
      },
    ],
    status: 'Cancel',
    weeks: '1',
    budget: '9.3',
  },
  {
    id: '6',
    imgsrc: img4,
    name: 'Mathew Anderson',
    email: 'nirav@gmail.com',
    pname: 'Hosting Press HTML',
    teams: [
      {
        id: '6.1',
        color: 'primary.main',
        text: 'Y',
      },
      {
        id: '6.2',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Active',
    weeks: '16',
    budget: '2.4',
  },
  {
    id: '7',
    imgsrc: img1,
    name: 'Sunil Joshi',
    email: 'sunil@gmail.com',
    pname: 'Elite Admin',
    teams: [
      {
        id: '7.1',
        color: 'secondary.main',
        text: 'S',
      },
      {
        id: '7.2',
        color: 'error.main',
        text: 'D',
      },
    ],
    status: 'Active',
    weeks: '12',
    budget: '3.9',
  },
  {
    id: '8',
    imgsrc: img2,
    name: 'Andrew McDownland',
    email: 'andrew@gmail.com',
    pname: 'Real Homes WP Theme',
    teams: [
      {
        id: '8.1',
        color: 'primary.main',
        text: 'A',
      },
      {
        id: '8.2',
        color: 'warning.main',
        text: 'X',
      },
      {
        id: '8.3',
        color: 'secondary.main',
        text: 'N',
      },
    ],
    status: 'Pending',
    weeks: '14',
    budget: '24.5',
  },
  {
    id: '9',
    imgsrc: img3,
    name: 'Christopher Jamil',
    email: 'jamil@gmail.com',
    pname: 'MedicalPro WP Theme',
    teams: [
      {
        id: '9.1',
        color: 'error.main',
        text: 'X',
      },
    ],
    status: 'Completed',
    weeks: '12',
    budget: '12.8',
  },

  {
    id: '10',
    imgsrc: img5,
    name: 'Micheal Doe',
    email: 'micheal@gmail.com',
    pname: 'Helping Hands WP Theme',
    teams: [
      {
        id: '10.1',
        color: 'secondary.main',
        text: 'S',
      },
    ],
    status: 'Cancel',
    weeks: '9',
    budget: '9.3',
  },
];
export { basicsTableData, EnhancedTableData };
