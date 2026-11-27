-- Every new user gets their own private copy of the demo data.
create or replace function public.seed_demo_data(uid uuid, fname text, lname text)
returns void language plpgsql security definer set search_path = '' as $$
declare sup uuid; cs uuid; lt uuid; bl uuid;
begin
  insert into public.profiles(id, first_name, last_name, phone, address) values (uid, fname, lname, '+1 (415) 555-0132', '221 Market St, San Francisco, CA 94105')
    on conflict (id) do nothing;
  insert into public.preferences(user_id, data) values (uid, '{}'::jsonb) on conflict do nothing;
  insert into public.accounts(user_id,name,mask,kind,detail,balance,sort) values
    (uid,'Everyday Checking','1233','checking','Primary',8420.18,1),
    (uid,'High-yield Savings','2345','savings','4.1% APY',11429.82,2),
    (uid,'Visa Credit','4402','credit','$250 due',-250.00,3);
  insert into public.transactions(user_id,merchant,description,account_mask,category,status,amount,occurred_at) values
    (uid,'Amazon','Refund · Order #112-48','2345','Refund','Completed',90.18,'2026-07-15 14:05-07'),
    (uid,'Oakwood Rentals','Rent · August','4402','Housing','Pending',-2750.00,'2026-07-15 10:01-07'),
    (uid,'Uniqlo','Shirt purchase','1233','Shopping','Completed',-84.98,'2026-07-11 20:41-07'),
    (uid,'Netflix','Premium subscription','1233','Subscription','Completed',-22.99,'2026-07-08 17:52-07'),
    (uid,'Acme Corp','Salary · July','2345','Salary','Completed',4750.00,'2026-07-07 05:18-07'),
    (uid,'Starbucks','Coffee & breakfast','1233','Food & drink','Completed',-14.60,'2026-07-06 08:12-07'),
    (uid,'Uber','Ride home','1233','Transport','Completed',-21.40,'2026-07-05 23:02-07'),
    (uid,'Spotify','Family · monthly','1233','Subscription','Completed',-16.99,'2026-07-09 09:00-07'),
    (uid,'ConEdison','Electricity bill','1233','Bills','Pending',-146.27,'2026-07-02 04:30-07'),
    (uid,'Dropbox','Plus · monthly','4402','Subscription','Completed',-11.99,'2026-07-01 06:00-07'),
    (uid,'Sarah Chen','Transfer received','2345','Transfer','Completed',600.00,'2026-06-24 08:16-07'),
    (uid,'Ticketmaster','Concert tickets','1233','Entertainment','Failed',-276.84,'2026-06-22 14:41-07'),
    (uid,'Starbucks','Coffee & breakfast','1233','Food & drink','Completed',-14.60,'2026-06-21 09:12-07'),
    (uid,'Uber','Ride to airport','1233','Transport','Completed',-38.20,'2026-06-20 06:05-07'),
    (uid,'City Gym','Monthly membership','1233','Health','Completed',-45.00,'2026-06-18 07:00-07'),
    (uid,'Amazon','Household essentials','1233','Shopping','Completed',-63.45,'2026-06-16 19:20-07'),
    (uid,'Netflix','Premium subscription','1233','Subscription','Completed',-22.99,'2026-06-08 17:52-07'),
    (uid,'Acme Corp','Salary · June','2345','Salary','Completed',4750.00,'2026-06-07 05:18-07'),
    (uid,'Uniqlo','Jacket','1233','Shopping','Completed',-129.90,'2026-06-05 18:10-07'),
    (uid,'ConEdison','Electricity bill','1233','Bills','Completed',-132.10,'2026-06-02 04:30-07');
  insert into public.subscriptions(user_id,name,plan,amount,next_date,state,autopay,sort) values
    (uid,'Netflix','Premium',22.99,'2026-08-08','Renews in 3 days',true,1),
    (uid,'Spotify','Family',16.99,'2026-08-09','Renews in 4 days',true,2),
    (uid,'iCloud+','2 TB',1.99,'2026-08-10','Renews in 5 days',true,3),
    (uid,'City Gym','Membership',45.00,'2026-08-18','Not used in 41 days',false,4),
    (uid,'Adobe Creative Cloud','All apps',59.99,'2026-08-21','Active',true,5),
    (uid,'NYT','Digital',4.25,'2026-08-24','Payment failed',true,6),
    (uid,'Duolingo','Super · yearly',83.99,'2027-01-12','Active',true,7),
    (uid,'Dropbox','Plus',11.99,'2026-08-30','Not used in 63 days',false,8);
  insert into public.notifications(user_id,tone,icon,title,body,action,created_at,read_at) values
    (uid,'warning','warning','You’ve used 82% of your weekly limit','$1,640 of $2,000 spent · $360 left until Monday','limit', now() - interval '12 minutes', null),
    (uid,'error','shield','Large payment: $2,750.00 to Oakwood Rentals','Visa •••• 4402 · over your $500 alert threshold','verify', now() - interval '1 hour', null),
    (uid,'info','Dropbox','Dropbox renews on Jul 19','$11.99 will be charged to Visa •••• 4402',null, now() - interval '3 hours', null),
    (uid,'info','loan','Loan payment due Jul 28','$486.20 · autopay from Everyday Checking is on',null, now() - interval '2 days', now()),
    (uid,'neutral','laptop','New sign-in on iPad · Safari','Oakland, CA · if this wasn’t you, sign it out','sessions', now() - interval '3 days', now()),
    (uid,'neutral','invoice','Your June statement is ready','Everyday Checking · 42 transactions','statement', now() - interval '4 days', now()),
    (uid,'success','dollar','Salary received','+$4,750.00 from Acme Corp into Everyday Checking',null, now() - interval '9 days', now()),
    (uid,'error','error','Payment failed: Ticketmaster','−$276.84 on •••• 1233 was declined · insufficient funds','retry', now() - interval '24 days', now());
  insert into public.threads(user_id,name,icon,tag,unread,updated_at) values (uid,'FinToe Support','support','Dispute open',2, now() - interval '20 minutes') returning id into sup;
  insert into public.threads(user_id,name,icon,unread,updated_at) values (uid,'Card services','card',0, now() - interval '1 day') returning id into cs;
  insert into public.threads(user_id,name,icon,unread,updated_at) values (uid,'Loans team','loan',0, now() - interval '3 days') returning id into lt;
  insert into public.threads(user_id,name,icon,unread,updated_at) values (uid,'Billing','invoice',0, now() - interval '15 days') returning id into bl;
  insert into public.messages(user_id,thread_id,sender,body,created_at) values
    (uid,sup,'me','Hi, I don’t recognise a $2,750.00 payment to Oakwood Rentals. Can you help?', now() - interval '42 minutes'),
    (uid,sup,'agent','Hi! I’m Maya from FinToe Support. I’ve frozen Visa •••• 4402 so nothing new can go through while we look into this.', now() - interval '40 minutes'),
    (uid,sup,'system','Visa •••• 4402 frozen', now() - interval '40 minutes'),
    (uid,sup,'me','Thanks. I was at home all day, so it wasn’t me.', now() - interval '36 minutes'),
    (uid,sup,'agent','Understood. I’ve opened dispute #48213 for $2,750.00. We’ll update you within 2 business days, and you won’t be charged while it’s open.', now() - interval '20 minutes'),
    (uid,cs,'agent','Your replacement Visa •••• 4402 ships once the dispute closes.', now() - interval '1 day'),
    (uid,lt,'agent','Autopay is set for your $486.20 car loan payment on Jul 28.', now() - interval '3 days'),
    (uid,bl,'agent','Receipt for FinToe Pro · July · $9.00', now() - interval '15 days');
  insert into public.cards(user_id,label,mask,theme,kind,detail,frozen,online,contactless,atm,international,gambling,sort) values
    (uid,'Everyday debit','4402','black','Debit','Visa •••• 4402 · Checking',false,true,true,true,false,false,1),
    (uid,'Online shopping','9817','orange','Virtual','Virtual •••• 9817 · $500 limit',false,true,false,false,false,false,2),
    (uid,'Travel','1290','grey','Debit','Visa •••• 1290 · Frozen Jul 20',true,true,true,true,true,false,3);
end $$;
revoke all on function public.seed_demo_data(uuid,text,text) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.seed_demo_data(new.id,
    coalesce(nullif(new.raw_user_meta_data->>'first_name',''),'Seeam'),
    coalesce(nullif(new.raw_user_meta_data->>'last_name',''),'Ahmod'));
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Resets the caller's own data (scoped to auth.uid()).
create or replace function public.reset_my_demo_data()
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); f text; l text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select first_name,last_name into f,l from public.profiles where id = uid;
  delete from public.accounts where user_id = uid; delete from public.transactions where user_id = uid;
  delete from public.subscriptions where user_id = uid; delete from public.notifications where user_id = uid;
  delete from public.threads where user_id = uid; delete from public.cards where user_id = uid;
  perform public.seed_demo_data(uid, coalesce(f,'Seeam'), coalesce(l,'Ahmod'));
end $$;
revoke all on function public.reset_my_demo_data() from public, anon;
grant execute on function public.reset_my_demo_data() to authenticated;
