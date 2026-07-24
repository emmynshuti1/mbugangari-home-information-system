-- HOUSE

INSERT INTO houses 
(name,owner,description,year_built,village,sector, district,province,country,latitude,longitude)

VALUES ('Mbugangari Home','Emmanuel Nshuti','A modern residential home located near Mbugangari Market in Mbugangari Village. The house provides a peaceful family environment with spacious rooms, a beautiful garden, secure fencing, and modern construction materials.',
2022,'Mbugangari','Gisenyi','Rubavu','Western Province','Rwanda',-1.702500,29.256700);

-- ROOMS

INSERT INTO rooms
(house_id,name,floor,length,width,description,image_url)

VALUES
(1,'Living Room','Ground Floor',7.00,6.00,'Large family sitting room with television and visitors area.','living-room.jpg'),
(1,'Kitchen','Ground Floor',5.00,4.50,'Modern kitchen with cabinets and storage.','kitchen.jpg'),
(1,'Dining Room','Ground Floor',4.00,4.00,'Room used for family meals.','dining-room.jpg'),
(1,'Master Bedroom','First Floor',6.00,5.00,'Main bedroom with private bathroom.','master-bedroom.jpg'),
(1,'Bedroom 2','First Floor',5.00,4.00,'Bedroom for family members.','bedroom2.jpg'),
(1,'Bathroom','Ground Floor',3.00,2.50,'Bathroom with shower and toilet.','bathroom.jpg');

-- GALLERY

INSERT INTO gallery
(house_id,image_url,caption)

VALUES
(1,'images/front-view.jpg','Front View of the House'),
(1,'images/back-yard.jpg','Backyard'),
(1,'images/garden.jpg','Garden'),
(1,'images/garage.jpg','Garage'),
(1,'images/living-room.jpg','Living Room'),
(1,'images/kitchen.jpg','Kitchen');

-- MATERIALS

INSERT INTO materials
(house_id,component,material_name,description)

VALUES
(1,'Foundation','Reinforced Concrete','Strong reinforced concrete foundation.'),
(1,'Walls','Burnt Bricks','Exterior and interior brick walls.'),
(1,'Roof','Iron Sheets','Modern painted iron sheets.'),
(1,'Doors','Hardwood','High quality hardwood doors.'),
(1,'Windows','Aluminium','Sliding aluminium windows.'),
(1,'Floor','Ceramic Tiles','Polished ceramic floor tiles.'),
(1,'Ceiling','Gypsum','Modern gypsum ceiling.');

-- HISTORY

INSERT INTO history
(house_id,title,description,event_date)

VALUES
(1,'Construction Started','Construction work officially began.','2021-03-15'),
(1,'House Completed','Construction was completed successfully.','2022-11-18'),
(1,'Garden Established','Flowers and trees were planted.','2023-04-20');

-- NEARBY PLACES

INSERT INTO nearby_places
(house_id,name,category,distance_meters,description)

VALUES
(1,'Mbugangari Market','Market',250,'Main public market near the home.'),
(1,'Health Centre','Hospital',800,'Nearest health facility.'),
(1,'Primary School','Education',600,'Nearby primary school.'),
(1,'Church','Religion',450,'Local church serving the community.');

-- ADMINISTRATOR

INSERT INTO administrators
(full_name,email,password_hash)

VALUES('Administrator','admin@mbugangarihome.com','$2b$10$RGrsg5lUwgWdGRRBM4EHh.QxCPjcyiVJNcJNq30E0Sv2ecPnx6phe');