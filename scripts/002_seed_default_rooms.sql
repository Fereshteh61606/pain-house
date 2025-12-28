-- Insert default support group rooms
INSERT INTO rooms (name, name_fa, description, description_fa, room_type, capacity) VALUES
  ('Depression Support', 'حمایت از افسردگی', 'A safe space to share experiences with depression', 'فضایی امن برای به اشتراک گذاشتن تجربیات افسردگی', 'text', 30),
  ('Anxiety Relief', 'تسکین اضطراب', 'Connect with others dealing with anxiety', 'با دیگران که با اضطراب مواجه هستند ارتباط برقرار کنید', 'audio', 20),
  ('Grief & Loss', 'غم و از دست دادن', 'Support for those experiencing grief and loss', 'حمایت برای کسانی که غم و از دست دادن را تجربه می کنند', 'text', 25),
  ('Trauma Recovery', 'بهبودی از تروما', 'A place for trauma survivors to connect', 'مکانی برای بازماندگان تروما برای ارتباط', 'audio', 20),
  ('Addiction Support', 'حمایت از اعتیاد', 'Recovery support for addiction challenges', 'حمایت بهبودی برای چالش های اعتیاد', 'text', 30),
  ('Self-Harm Recovery', 'بهبودی از خودآزاری', 'Support for those overcoming self-harm', 'حمایت برای کسانی که خودآزاری را پشت سر می گذارند', 'text', 25),
  ('Eating Disorders', 'اختلالات خوردن', 'Connect with others facing eating disorders', 'با دیگران که با اختلالات خوردن مواجه هستند ارتباط برقرار کنید', 'audio', 20);
