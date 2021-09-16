import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import styles from '../styles/signup.module.css';
import {makeStyles} from '@material-ui/core/styles';
import {Grow, Avatar, Button, Typography, Container, TextField} from '@material-ui/core';
import {files, account} from 'web-snippets';
import {get, post} from 'axios';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import Autocomplete from '@material-ui/lab/Autocomplete';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

const useStyles = makeStyles(theme => ({
    avatarStyle: {
        width: theme.spacing(10),
        height: theme.spacing(10),
        cursor: 'pointer',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));
export default function ContainerComp() {
    return <Signup />;
}

function Signup() {
    const [image, setImage] = useState('../static/testImages/kotone.png');
    const [stepOne, setStepOne] = useState(true);
    const [stepTwo, setStepTwo] = useState(false);
    const [step, setStep] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [pwCf, setPwCf] = useState('');
    const [errFirstName, setErrFirstName] = useState(false);
    const [errLastName, setErrLastName] = useState(false);
    const [errNickname, setErrNickname] = useState(false);
    const [errPw, setErrPw] = useState(false);
    const [errPwCf, setErrPwCf] = useState(false);
    const [errEmail, setErrEmail] = useState(false);
    const [bundle, setBundle] = useState({});
    const classes = useStyles();
    const [position, setPosition] = useState(-1);
    const [companyName, setCompanyName] = useState('');
    const [companyList, setCompanyList] = useState([]);
    const [state, setState] = React.useState({
        age: '',
        name: 'hai',
    });

    const handleFileUploader = () => {
        const uploader = document.getElementById('profileFile');
        uploader.click();
    };

    const handleFileChange = () => {
        const uploader = document.getElementById('profileFile');
        const fileName = uploader.files[0].name;
        const fileSize = uploader.files[0].size;
        const {isValid, errMessage} = files.imageValid(uploader.files[0], '3mb');

        if (isValid) {
            const imageURL = URL.createObjectURL(uploader.files[0]);
            setImage(imageURL);
        }
    };

    const checkValidationStrings = e => {
        const str = e.target.value;
        const id = e.target.id;

        const {isValid, errMessage} = account.cValid(str, 0, 30);

        if (id === 'first_name') {
            if (isValid) {
                setFirstName(str);
                setErrFirstName(false);
            } else {
                alert(errMessage);
                setErrFirstName(true);
            }
        }

        if (id === 'last_name') {
            if (isValid) {
                setLastName(str);
                setErrLastName(false);
            } else {
                alert(errMessage);
                setErrLastName(true);
            }
        }

        if (id === 'company_name') {
            setPosition(str);
        }
    };

    const checkValidationPw = e => {
        const pw = e.target.value;
        const {isValid, errMessage} = account.cValid(pw, 8, 30, ['special, capital, number']);

        if (isValid) {
            setPw(pw);
            setErrPw(false);
        } else {
            alert(errMessage);
            setErrPw(true);
        }
    };

    const checkValidationPwCf = e => {
        const typedPwCf = e.target.value;
        const isValid = account.confirmPw(pw, typedPwCf);

        isValid ? errPwCf(false) : errPwCf(true);

        setPwCf(typedPwCf);
    };

    const checkValidationEmail = e => {
        const typedEmail = e.target.value;
        const isValid = account.fullEmailValid(typedEmail);

        isValid ? setErrEmail(false) : setErrEmail(true);

        setEmail(typedEmail);
    };

    const checkValidationNickname = e => {
        const typedNickname = e.target.value;
        const url = '/api/account/checkDuplicateNickname?nickname=' + typedNickname;

        get(url)
            .then(res => {
                const data = res.data;

                if (data['COUNT(*)'] === 0) {
                    setErrNickname(false);
                } else {
                    setErrNickname(true);
                }

                setNickname(typedNickname);
            })
            .catch(e => console.log(e));
    };

    const handleSteps = step => {
        setStep(step);

        if (step === 1) {
            setStepOne(false);
            setStepTwo(true);
        }
    };

    const handlePositionChange = e => {
        const id = parseInt(e.target.value);
        setPosition(id); // -1: none, 0: owner, 1: member
    };

    const handleChangeCompany = e => {
        const company = e.target.value;

        if (company.length === 1) {
            const url = '/api/company/getCompanyList?str=' + company;
            get(url).then(res => {
                const data = res.data;
                console.log('🚀 ~ file: signup.js ~ line 181 ~ get ~ data', data);
                const refinedData = data.map(curr => {
                    curr.COMPANY_NAME += ` COMPANY_ID: ${curr.COMPANY_PK}`;
                    return curr;
                });
                console.log('🚀 ~ file: signup.js ~ line 185 ~ get ~ refinedData', refinedData);
                setCompanyList(refinedData);
            });
        }

        setCompanyName(company);
    };

    return (
        <React.Fragment>
            <div className={styles.wrapper}>
                <div className={styles.resizing}>
                    <CssBaseline />
                    {/* Step 1 */}
                    <Grow in={stepOne}>
                        <Container maxWidth='sm' style={{display: stepOne ? 'block' : 'none'}}>
                            <Typography
                                component='div'
                                style={{backgroundColor: '#FFFFFF', height: '95vh', width: '70vh'}}
                            >
                                <div className={styles.formDiv}>
                                    <Avatar
                                        alt='Profile Image Preview'
                                        src={image}
                                        className={classes.avatarStyle}
                                        onClick={handleFileUploader}
                                    />
                                    <TextField
                                        id='first_name'
                                        label='First name'
                                        variant='outlined'
                                        size='small'
                                        error={errFirstName}
                                        onChange={checkValidationStrings}
                                    />
                                    <TextField
                                        id='last_name'
                                        label='Last name'
                                        variant='outlined'
                                        size='small'
                                        error={errLastName}
                                        onChange={checkValidationStrings}
                                    />
                                    <TextField
                                        id='user_name'
                                        label='Nickname'
                                        variant='outlined'
                                        size='small'
                                        error={errNickname}
                                        onChange={checkValidationNickname}
                                    />
                                    <TextField
                                        type='password'
                                        id='password'
                                        label='Password'
                                        variant='outlined'
                                        error={errPw}
                                        size='small'
                                        onChange={checkValidationPw}
                                    />
                                    <TextField
                                        type='password'
                                        id='password_cf'
                                        label='Password Confirmation'
                                        variant='outlined'
                                        error={errPwCf}
                                        size='small'
                                        onChange={checkValidationPwCf}
                                    />
                                    <TextField
                                        id='email'
                                        label='E-mail'
                                        variant='outlined'
                                        size='small'
                                        error={errEmail}
                                        onChange={checkValidationEmail}
                                    />
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={() => {
                                            handleSteps(1);
                                        }}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </Typography>
                            <input
                                type='file'
                                name='file'
                                id='profileFile'
                                style={{display: 'none'}}
                                onChange={handleFileChange}
                            />
                        </Container>
                    </Grow>
                    {/* step 2 */}
                    <Grow in={stepTwo}>
                        <Container maxWidth='sm' style={{display: stepTwo ? 'block' : 'none'}}>
                            <Typography
                                component='div'
                                style={{backgroundColor: '#FFFFFF', height: '85vh', width: '70vh'}}
                            >
                                <div className={styles.formDiv}>
                                    <Avatar
                                        alt='Profile Image Preview'
                                        src={image}
                                        className={classes.avatarStyle}
                                        onClick={handleFileUploader}
                                    />
                                    <FormControl variant='outlined' className={classes.formControl}>
                                        <InputLabel htmlFor='outlined-position-native-simple'>Position</InputLabel>
                                        <Select
                                            native
                                            value={position}
                                            onChange={handlePositionChange}
                                            label='position'
                                            inputProps={{
                                                name: 'position',
                                                id: 'outlined-position-native-simple',
                                            }}
                                        >
                                            <option aria-label='None' value={-1} />
                                            <option value={0}>Owner</option>
                                            <option value={1}>Member</option>
                                        </Select>
                                    </FormControl>
                                    {position === 0 ? (
                                        <TextField
                                            id='company_name'
                                            label='Company name'
                                            variant='outlined'
                                            size='small'
                                            onChange={checkValidationStrings}
                                        />
                                    ) : (
                                        <Autocomplete
                                            id='highlights-demo'
                                            style={{width: 300}}
                                            options={companyList}
                                            getOptionLabel={option => option.COMPANY_NAME}
                                            renderInput={params => (
                                                <TextField
                                                    {...params}
                                                    label='Highlights'
                                                    variant='outlined'
                                                    margin='normal'
                                                    onChange={handleChangeCompany}
                                                />
                                            )}
                                            renderOption={(option, {inputValue}) => {
                                                const matches = match(option.COMPANY_NAME, inputValue);
                                                const parts = parse(option.COMPANY_NAME, matches);

                                                return (
                                                    <div>
                                                        {parts.map((part, index) => (
                                                            <span
                                                                key={index}
                                                                style={{fontWeight: part.highlight ? 700 : 400}}
                                                            >
                                                                {part.text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                );
                                            }}
                                        />
                                    )}
                                    <Button
                                        variant='contained'
                                        color='secondary'
                                        onClick={() => {
                                            handleSteps();
                                        }}
                                    >
                                        previous
                                    </Button>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={() => {
                                            handleSteps(2);
                                        }}
                                    >
                                        sign-up
                                    </Button>
                                </div>
                            </Typography>
                        </Container>
                    </Grow>
                </div>
            </div>
        </React.Fragment>
    );
}

const top100Films = [
    {title: 'The Shawshank Redemption', year: 1994},
    {title: 'The Godfather', year: 1972},
    {title: 'The Godfather: Part II', year: 1974},
    {title: 'The Dark Knight', year: 2008},
    {title: '12 Angry Men', year: 1957},
    {title: "Schindler's List", year: 1993},
    {title: 'Pulp Fiction', year: 1994},
    {title: 'The Lord of the Rings: The Return of the King', year: 2003},
    {title: 'The Good, the Bad and the Ugly', year: 1966},
    {title: 'Fight Club', year: 1999},
    {title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001},
    {title: 'Star Wars: Episode V - The Empire Strikes Back', year: 1980},
    {title: 'Forrest Gump', year: 1994},
    {title: 'Inception', year: 2010},
    {title: 'The Lord of the Rings: The Two Towers', year: 2002},
    {title: "One Flew Over the Cuckoo's Nest", year: 1975},
    {title: 'Goodfellas', year: 1990},
    {title: 'The Matrix', year: 1999},
    {title: 'Seven Samurai', year: 1954},
    {title: 'Star Wars: Episode IV - A New Hope', year: 1977},
    {title: 'City of God', year: 2002},
    {title: 'Se7en', year: 1995},
    {title: 'The Silence of the Lambs', year: 1991},
    {title: "It's a Wonderful Life", year: 1946},
    {title: 'Life Is Beautiful', year: 1997},
    {title: 'The Usual Suspects', year: 1995},
    {title: 'Léon: The Professional', year: 1994},
    {title: 'Spirited Away', year: 2001},
    {title: 'Saving Private Ryan', year: 1998},
    {title: 'Once Upon a Time in the West', year: 1968},
    {title: 'American History X', year: 1998},
    {title: 'Interstellar', year: 2014},
    {title: 'Casablanca', year: 1942},
    {title: 'City Lights', year: 1931},
    {title: 'Psycho', year: 1960},
    {title: 'The Green Mile', year: 1999},
    {title: 'The Intouchables', year: 2011},
    {title: 'Modern Times', year: 1936},
    {title: 'Raiders of the Lost Ark', year: 1981},
    {title: 'Rear Window', year: 1954},
    {title: 'The Pianist', year: 2002},
    {title: 'The Departed', year: 2006},
    {title: 'Terminator 2: Judgment Day', year: 1991},
    {title: 'Back to the Future', year: 1985},
    {title: 'Whiplash', year: 2014},
    {title: 'Gladiator', year: 2000},
    {title: 'Memento', year: 2000},
    {title: 'The Prestige', year: 2006},
    {title: 'The Lion King', year: 1994},
    {title: 'Apocalypse Now', year: 1979},
    {title: 'Alien', year: 1979},
    {title: 'Sunset Boulevard', year: 1950},
    {title: 'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb', year: 1964},
    {title: 'The Great Dictator', year: 1940},
    {title: 'Cinema Paradiso', year: 1988},
    {title: 'The Lives of Others', year: 2006},
    {title: 'Grave of the Fireflies', year: 1988},
    {title: 'Paths of Glory', year: 1957},
    {title: 'Django Unchained', year: 2012},
    {title: 'The Shining', year: 1980},
    {title: 'WALL·E', year: 2008},
    {title: 'American Beauty', year: 1999},
    {title: 'The Dark Knight Rises', year: 2012},
    {title: 'Princess Mononoke', year: 1997},
    {title: 'Aliens', year: 1986},
    {title: 'Oldboy', year: 2003},
    {title: 'Once Upon a Time in America', year: 1984},
    {title: 'Witness for the Prosecution', year: 1957},
    {title: 'Das Boot', year: 1981},
    {title: 'Citizen Kane', year: 1941},
    {title: 'North by Northwest', year: 1959},
    {title: 'Vertigo', year: 1958},
    {title: 'Star Wars: Episode VI - Return of the Jedi', year: 1983},
    {title: 'Reservoir Dogs', year: 1992},
    {title: 'Braveheart', year: 1995},
    {title: 'M', year: 1931},
    {title: 'Requiem for a Dream', year: 2000},
    {title: 'Amélie', year: 2001},
    {title: 'A Clockwork Orange', year: 1971},
    {title: 'Like Stars on Earth', year: 2007},
    {title: 'Taxi Driver', year: 1976},
    {title: 'Lawrence of Arabia', year: 1962},
    {title: 'Double Indemnity', year: 1944},
    {title: 'Eternal Sunshine of the Spotless Mind', year: 2004},
    {title: 'Amadeus', year: 1984},
    {title: 'To Kill a Mockingbird', year: 1962},
    {title: 'Toy Story 3', year: 2010},
    {title: 'Logan', year: 2017},
    {title: 'Full Metal Jacket', year: 1987},
    {title: 'Dangal', year: 2016},
    {title: 'The Sting', year: 1973},
    {title: '2001: A Space Odyssey', year: 1968},
    {title: "Singin' in the Rain", year: 1952},
    {title: 'Toy Story', year: 1995},
    {title: 'Bicycle Thieves', year: 1948},
    {title: 'The Kid', year: 1921},
    {title: 'Inglourious Basterds', year: 2009},
    {title: 'Snatch', year: 2000},
    {title: '3 Idiots', year: 2009},
    {title: 'Monty Python and the Holy Grail', year: 1975},
];
