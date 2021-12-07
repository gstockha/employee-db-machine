INSERT INTO departments (name) VALUES
    ('Engineering'), ('Sales'), ('Finance'), ('Legal');

INSERT INTO roles (title, salary, dept_id) VALUES
    ('Lead Engineer', 150000, 1),
    ('Software Engineer', 120000, 1),
    ('Salesperson', 80000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
    ('Lubby', 'Gubby', 1, NULL),
    ('Truggy', 'Duggy', 2, 1),
    ('Needit', 'Keepit', 2 ,1),
    ('Habit', 'Nabit', 2 ,1),
    ('Bakey', 'Takey', 3, NULL),
    ('Shilly','Krilly', 3, NULL),
    ('Oopsie', 'Doopsie', 4, NULL),
    ('Telly', 'Belly', 5, 7),
    ('Gobo', 'Bobo', 5, 7),
    ('Wooster', 'Zooster', 6, NULL),
    ('Orbit', 'Snorbit', 7, 10),
    ('Noter', 'Moter', 7, 10);