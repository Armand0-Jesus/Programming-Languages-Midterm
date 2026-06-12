% Tau Prolog rules for simple study recommendation.
% Facts are injected from the web UI before each query.

best_recommendation(study_for_exam) :- exam_soon, difficult_subject, !.
best_recommendation(study_for_exam) :- exam_soon, !.
best_recommendation(finish_project_milestone) :- deadline_soon, !.
best_recommendation(practice_hard_topic) :- difficult_subject, \+ low_energy, !.
best_recommendation(light_review) :- low_energy, !.
best_recommendation(plan_and_review).

% Example facts from UI:
% exam_soon.
% deadline_soon.
% difficult_subject.
% low_energy.
